import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const TEST_DB = "file:./prisma/test.db";

/** Fresh, fully migrated SQLite database for every test run (never touches dev.db). */
export default function setup() {
  for (const file of ["prisma/test.db", "prisma/test.db-journal"]) rmSync(file, { force: true });
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: TEST_DB } });
}
