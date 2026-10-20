import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  APP_URL: z.url().default("http://localhost:3000"),
  TRUSTED_ORIGINS: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  /** A Gmail account to send email through (with an App password) — a stop-gap for sending to anyone before a
   *  domain is verified with Resend. When both are set, Gmail is used instead of Resend. */
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  /** Where "a new Mystery Book order was placed" emails go. Unset = no such email (ordering is unaffected). */
  ORDER_NOTIFICATION_EMAIL: z.string().optional(),
  /** Powers "Auto-fill" (Google Books). Without it, it still works against Google's shared keyless quota — a free
   *  personal key just gets its own private quota instead. "Find Cover" uses Open Library instead, which needs
   *  no key at all. */
  GOOGLE_BOOKS_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Validated environment, parsed once. Fails fast with a readable message when configuration is wrong. */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${problems}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = () => getEnv().NODE_ENV === "production";
