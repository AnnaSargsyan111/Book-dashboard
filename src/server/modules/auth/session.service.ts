import { AUTH_POLICY } from "@/server/config/policy";
import { getDb } from "@/server/db/client";
import { generateToken, hashToken } from "@/server/security/tokens";
import type { PublicUser } from "@/shared/api-errors";
import { toPublicUser } from "./user.repository";

export interface IssuedSession {
  token: string;
  expiresAt: Date;
}

export async function createSession(userId: string): Promise<IssuedSession> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + AUTH_POLICY.session.ttlMs);
  await getDb().session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  return { token, expiresAt };
}

export interface ResolvedSession {
  user: PublicUser;
  /** Set when the expiry slid forward and the cookie must be re-issued. */
  renewed?: IssuedSession;
}

/**
 * Looks a cookie token up. Every request hits the database, so signing out (or resetting a password) revokes a
 * session immediately. `slide: false` is for read-only callers (server components cannot set cookies).
 */
export async function resolveSession(token: string, options: { slide: boolean }): Promise<ResolvedSession | null> {
  const db = getDb();
  const session = await db.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session) return null;

  const now = Date.now();
  if (session.expiresAt.getTime() <= now) {
    await db.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  const user = toPublicUser(session.user);
  if (options.slide && now - session.lastUsedAt.getTime() > AUTH_POLICY.session.slideAfterMs) {
    const expiresAt = new Date(now + AUTH_POLICY.session.ttlMs);
    await db.session.update({ where: { id: session.id }, data: { expiresAt, lastUsedAt: new Date(now) } });
    return { user, renewed: { token, expiresAt } };
  }
  return { user };
}

/** Idempotent: an unknown token is not an error. */
export async function revokeSession(token: string): Promise<void> {
  await getDb().session.deleteMany({ where: { tokenHash: hashToken(token) } });
  if (Math.random() < 0.02) await getDb().session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}

/** Used by change-password: keeps the caller's own session valid (no forced re-login) and signs out every other one. */
export async function revokeOtherSessions(userId: string, currentToken: string): Promise<void> {
  await getDb().session.deleteMany({ where: { userId, NOT: { tokenHash: hashToken(currentToken) } } });
}
