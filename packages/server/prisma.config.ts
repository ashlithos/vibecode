import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 keeps the connection URL here rather than in schema.prisma, and no
 * longer auto-loads .env — hence the explicit read.
 *
 * Postgres (Neon) in every environment, including local dev, so there is no
 * SQLite-vs-Postgres behavioural gap between what you test and what ships.
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
