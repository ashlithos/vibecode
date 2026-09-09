import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';

/**
 * Postgres, via the standard driver.
 *
 * Neon's own serverless driver exists mainly for edge runtimes; this app runs
 * on Node, where a pooled Neon connection string over the normal Postgres
 * protocol is equivalent and has two practical advantages: one code path, and
 * a database you can actually run locally to test against.
 *
 * Use the POOLED Neon endpoint (its host contains "-pooler"). The direct
 * endpoint opens a backend per connection and will exhaust under serverless
 * fan-out.
 *
 * The pool is created once per module load — on Vercel that means once per cold
 * start, then reused by every warm invocation.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and point it at your Postgres database.',
  );
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    // Serverless invocations are short and may be frozen between requests;
    // a small pool that gives connections back quickly suits that shape.
    max: 3,
    idleTimeoutMillis: 10_000,
  }),
});
