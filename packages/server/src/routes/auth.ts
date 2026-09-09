import type { FastifyInstance } from 'fastify';
import oauthPlugin from '@fastify/oauth2';
import { EQUIPMENT } from '@gym/shared';
import { prisma } from '../db.js';
import {
  SESSION_COOKIE,
  createSessionToken,
  isAllowed,
  publicBaseUrl,
  sessionCookieOptions,
} from '../auth.js';

/**
 * @fastify/oauth2 uses `export =` bound to its namespace only, so the provider
 * constants it exports at runtime are invisible to TypeScript. Cast rather than
 * re-declaring Google's endpoints here, which would silently rot if they moved.
 */
const { GOOGLE_CONFIGURATION } = oauthPlugin as unknown as {
  GOOGLE_CONFIGURATION: {
    authorizeHost: string;
    authorizePath: string;
    tokenHost: string;
    tokenPath: string;
  };
};

interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

export async function authRoutes(app: FastifyInstance) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // Without credentials the app still boots and serves /api/auth/me, so the UI
  // can render a clear "sign-in isn't configured" state instead of white-screening.
  const configured = Boolean(clientId && clientSecret);

  if (configured) {
    await app.register(oauthPlugin, {
      // Must start with "oauth2" + an uppercase letter — that is the shape the
      // plugin's FastifyInstance index signature types.
      name: 'oauth2Google',
      scope: ['openid', 'email', 'profile'],
      credentials: {
        client: { id: clientId!, secret: clientSecret! },
        auth: GOOGLE_CONFIGURATION,
      },
      startRedirectPath: '/api/auth/google',
      callbackUri: `${publicBaseUrl()}/api/auth/google/callback`,
    });

    app.get('/api/auth/google/callback', async (req, reply) => {
      let profile: GoogleProfile;

      try {
        const { token } =
          await app.oauth2Google!.getAccessTokenFromAuthorizationCodeFlow(req);

        const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: { Authorization: `Bearer ${token.access_token}` },
        });
        if (!res.ok) throw new Error(`userinfo request failed (${res.status})`);
        profile = (await res.json()) as GoogleProfile;
      } catch (err) {
        req.log.error({ err }, 'google oauth callback failed');
        return reply.redirect('/?auth_error=exchange');
      }

      if (!profile.email) return reply.redirect('/?auth_error=no_email');

      // An unverified Google address can be an address the person does not
      // control, which would make the allowlist meaningless.
      if (profile.email_verified === false) {
        return reply.redirect('/?auth_error=unverified');
      }

      if (!isAllowed(profile.email)) {
        req.log.warn({ email: profile.email }, 'sign-in refused: not on allowlist');
        return reply.redirect('/?auth_error=not_allowed');
      }

      const email = profile.email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });

      const user = await prisma.user.upsert({
        where: { email },
        create: {
          email,
          name: profile.name ?? null,
          image: profile.picture ?? null,
        },
        update: {
          name: profile.name ?? null,
          image: profile.picture ?? null,
        },
      });

      // First sign-in: give the new account the same defaults the seed script
      // used to create for the single local user.
      if (!existing) {
        await prisma.userSettings.create({ data: { userId: user.id } });
        await prisma.equipmentAvailability.createMany({
          data: EQUIPMENT.map((equipment) => ({
            userId: user.id,
            equipment,
            available: true,
          })),
        });
      }

      const jwt = await createSessionToken({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      });

      reply.setCookie(SESSION_COOKIE, jwt, sessionCookieOptions());
      return reply.redirect('/');
    });
  }

  /** Who am I? 401 when signed out — this is what the UI gates on. */
  app.get('/api/auth/me', async (req, reply) => {
    if (!req.user) {
      return reply.code(401).send({
        error: 'Not signed in',
        signInConfigured: configured,
      });
    }
    return { user: req.user, signInConfigured: configured };
  });

  app.post('/api/auth/logout', async (_req, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  });
}
