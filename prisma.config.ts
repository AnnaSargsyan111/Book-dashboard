import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Migrations should use a direct (non-pooled) connection when one is provided — on Neon that is the URL
  // without "-pooler" in the host (Vercel's Neon integration exposes it as DATABASE_URL_UNPOOLED). The running
  // app only ever reads DATABASE_URL.
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "" },
});
