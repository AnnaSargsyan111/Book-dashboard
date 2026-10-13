import { getDb } from "@/server/db/client";
import { ApiError } from "@/server/http/errors";

export interface LimitRule {
  limit: number;
  windowMs: number;
}

/**
 * Sliding-window limiter backed by the database (survives restarts, works across instances).
 * Events are recorded explicitly (for example only FAILED logins); `enforceLimit` compares the count in the window.
 */
export async function enforceLimit(scope: string, key: string, rule: LimitRule, now = new Date()): Promise<void> {
  const db = getDb();
  const since = new Date(now.getTime() - rule.windowMs);
  const where = { scope, key, occurredAt: { gt: since } };
  const count = await db.rateLimitEvent.count({ where });
  if (count < rule.limit) return;

  const oldest = await db.rateLimitEvent.findFirst({ where, orderBy: { occurredAt: "asc" }, select: { occurredAt: true } });
  const retryAfterSeconds = oldest
    ? Math.max(1, Math.ceil((oldest.occurredAt.getTime() + rule.windowMs - now.getTime()) / 1000))
    : Math.ceil(rule.windowMs / 1000);
  throw new ApiError("RATE_LIMITED", 429, { retryAfterSeconds });
}

export async function recordEvent(scope: string, key: string, now = new Date()): Promise<void> {
  const db = getDb();
  await db.rateLimitEvent.create({ data: { scope, key, occurredAt: now } });
  // Opportunistic housekeeping keeps the table small without a scheduled job.
  if (Math.random() < 0.02) {
    await db.rateLimitEvent.deleteMany({ where: { occurredAt: { lt: new Date(now.getTime() - 24 * 3_600_000) } } });
  }
}

export async function clearEvents(scope: string, key?: string): Promise<void> {
  await getDb().rateLimitEvent.deleteMany({ where: key === undefined ? { scope } : { scope, key } });
}
