import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 moved the connection URL out of schema.prisma and into this file,
 * and no longer auto-loads .env — hence the explicit fallback.
 *
 * The database is a single SQLite file under prisma/. Small enough for one
 * user, and backed up by copying it.
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  },
});
