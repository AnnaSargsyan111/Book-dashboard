import { execSync } from "node:child_process";
import { Client } from "pg";
import { TEST_SCHEMA, testDatabaseUrl } from "./test-db";

/** Fresh, fully migrated `test` schema for every run (never touches any other schema). */
export default async function setup() {
  const url = testDatabaseUrl();

  const admin = new URL(url);
  admin.searchParams.delete("schema");
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    await client.query(`DROP SCHEMA IF EXISTS "${TEST_SCHEMA}" CASCADE`);
    await client.query(`CREATE SCHEMA "${TEST_SCHEMA}"`);
  } finally {
    await client.end();
  }

  execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: url, DIRECT_URL: "" } });
  process.env.DATABASE_URL = url;
}
