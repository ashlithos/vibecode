import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import { resolveUser, type SessionUser } from './auth.js';
import { exerciseRoutes } from './routes/exercises.js';
import { workoutRoutes } from './routes/workouts.js';
import { settingsRoutes } from './routes/settings.js';
import { authRoutes } from './routes/auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: SessionUser | null;
  }
}

/** Public endpoints. Everything else under /api requires a session. */
const PUBLIC_PATHS = new Set(['/api/health']);
const PUBLIC_PREFIXES = ['/api/auth/'];

function isPublic(url: string): boolean {
  const path = url.split('?')[0];
  if (PUBLIC_PATHS.has(path)) return true;
  return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * Builds the Fastify app.
 *
 * Separated from listening so the same app can be served by `node src/index.ts`
 * locally and by a Vercel Function in production.
 */
export async function buildApp(opts: { logger?: boolean } = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger === false ? false : { level: process.env.LOG_LEVEL ?? 'info' },
    // Vercel terminates TLS upstream; without this, redirect URLs and secure
    // cookies are computed against http and the OAuth round trip breaks.
    trustProxy: true,
  });

  await app.register(cookie, { secret: process.env.AUTH_SECRET });

  app.decorateRequest('user', null);

  // Resolve the session before every request so routes can read req.user, then
  // reject unauthenticated API calls. Default-deny: a new route is protected
  // unless it is explicitly added to the public list above.
  app.addHook('preHandler', async (req, reply) => {
    req.user = await resolveUser(req);

    if (!req.url.startsWith('/api')) return;
    if (isPublic(req.url)) return;
    if (req.user) return;

    return reply.code(401).send({ error: 'Not signed in' });
  });

  await app.register(authRoutes);
  await app.register(exerciseRoutes);
  await app.register(workoutRoutes);
  await app.register(settingsRoutes);

  app.get('/api/health', async () => ({ ok: true }));

  return app;
}
