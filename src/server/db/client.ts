import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getEnv } from "@/server/config/env";

// One client per process, kept across dev hot-reloads.
const globalForDb = globalThis as typeof globalThis & { __mystbookDb?: PrismaClient };

/**
 * The only place a database connection is created. `DATABASE_URL` is a PostgreSQL connection string (on Neon,
 * the pooled one). An optional `?schema=name` selects a non-default schema — the tests use it to stay out of
 * `public`; `pg` doesn't understand that parameter, so it is lifted out and handed to the adapter instead.
 */
export function getDb(): PrismaClient {
  if (!globalForDb.__mystbookDb) {
    const url = new URL(getEnv().DATABASE_URL);
    const schema = url.searchParams.get("schema") ?? undefined;
    url.searchParams.delete("schema");
    const adapter = new PrismaPg({ connectionString: url.toString() }, schema ? { schema } : undefined);
    globalForDb.__mystbookDb = new PrismaClient({ adapter });
  }
  return globalForDb.__mystbookDb;
}

/** True when a Prisma error is a unique-constraint violation (the DB-level duplicate guard firing). */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}
