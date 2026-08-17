import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '..');

/**
 * Resolve `file:` URLs against the server package rather than the current
 * working directory, so the same database is used whether a script is run
 * from the repo root or from packages/server.
 */
function resolveDatabaseUrl(raw: string): string {
  if (!raw.startsWith('file:')) return raw;

  const filePath = raw.slice('file:'.length);
  if (path.isAbsolute(filePath)) return raw;

  return `file:${path.resolve(packageRoot, filePath)}`;
}

const url = resolveDatabaseUrl(process.env.DATABASE_URL ?? 'file:./prisma/dev.db');

export const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url }),
});

/** Single-user MVP. Every user-scoped row hangs off this id. */
export const USER_ID = 'local';
