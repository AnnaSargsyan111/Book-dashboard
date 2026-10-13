import "dotenv/config";

export const TEST_SCHEMA = "test";

/**
 * The tests run against a real PostgreSQL database (TEST_DATABASE_URL — e.g. a throwaway Neon branch or a local
 * server), always inside their own `test` schema so they can never touch real data in `public`.
 */
export function testDatabaseUrl(): string {
  const raw = process.env.TEST_DATABASE_URL;
  if (!raw) {
    throw new Error("TEST_DATABASE_URL is not set. Point it at a PostgreSQL database (a scratch one — only its `test` schema is used).");
  }
  const url = new URL(raw);
  url.searchParams.set("schema", TEST_SCHEMA);
  return url.toString();
}
