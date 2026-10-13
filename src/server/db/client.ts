import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { getEnv } from "@/server/config/env";

// One client per process, kept across dev hot-reloads.
const globalForDb = globalThis as typeof globalThis & { __mystbookDb?: PrismaClient };

/**
 * The only place a database connection is created. Swapping SQLite for PostgreSQL later means changing this file
 * (adapter) plus the schema provider; repositories and services do not change.
 */
export function getDb(): PrismaClient {
  if (!globalForDb.__mystbookDb) {
    const adapter = new PrismaBetterSqlite3({ url: getEnv().DATABASE_URL });
    globalForDb.__mystbookDb = new PrismaClient({ adapter });
  }
  return globalForDb.__mystbookDb;
}

/** True when a Prisma error is a unique-constraint violation (the DB-level duplicate guard firing). */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}
