import { testDatabaseUrl } from "./test-db";

process.env.DATABASE_URL = testDatabaseUrl();
process.env.APP_URL = "http://localhost:3000";
delete process.env.RESEND_API_KEY;
delete process.env.EMAIL_FROM;
delete process.env.ANTHROPIC_API_KEY;
for (const key of Object.keys(process.env)) if (key.endsWith("_READ_WRITE_TOKEN")) delete process.env[key];
delete process.env.BLOB_STORE_ID;
