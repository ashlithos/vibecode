import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client.js';

const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';

const adapter = new PrismaBetterSqlite3({ url });

export const prisma = new PrismaClient({ adapter });

/** Single-user MVP. Every user-scoped row hangs off this id. */
export const USER_ID = 'local';
