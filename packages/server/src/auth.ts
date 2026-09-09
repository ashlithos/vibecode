import { SignJWT, jwtVerify } from 'jose';
import type { FastifyRequest } from 'fastify';
import { prisma } from './db.js';

/**
 * Session handling.
 *
 * The session is a signed JWT in an HttpOnly cookie — no session table, no
 * shared store, which is what makes it work across serverless instances that
 * share nothing. Identity itself comes from Google; see routes/auth.ts.
 */

export const SESSION_COOKIE = 'gym_session';
const SESSION_DAYS = 30;

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error('AUTH_SECRET is not set — sessions cannot be signed. See .env.example.');
  }
  return new TextEncoder().encode(value);
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    // Lax rather than Strict: the Google callback is a cross-site redirect back
    // into the app, and Strict would withhold the cookie on that first landing.
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

/**
 * Resolves the session cookie to a real user row.
 *
 * Deliberately re-reads the user each request rather than trusting the JWT
 * payload, so revoking access is a database delete rather than a wait for every
 * outstanding token to expire.
 */
export async function resolveUser(req: FastifyRequest): Promise<SessionUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return null;
    if (!isAllowed(user.email)) return null;

    return { id: user.id, email: user.email, name: user.name, image: user.image };
  } catch {
    // Expired, tampered with, or signed by a rotated secret — all mean "log in".
    return null;
  }
}

/**
 * Allowlist gate.
 *
 * An empty ALLOWED_EMAILS means open signup. That is a deliberate, explicit
 * choice rather than the default, because a public URL with open signup lets
 * strangers create rows against your database quota.
 */
export function isAllowed(email: string): boolean {
  const raw = process.env.ALLOWED_EMAILS?.trim();
  if (!raw) return true;

  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

/** Base URL for OAuth callbacks. Vercel provides VERCEL_URL without a scheme. */
export function publicBaseUrl(): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:5178';
}
