import { AUTH_POLICY } from "@/server/config/policy";
import { getEnv } from "@/server/config/env";
import { getDb, isUniqueViolation } from "@/server/db/client";
import { ApiError } from "@/server/http/errors";
import { getTranslator } from "@/server/i18n/translator";
import { sendEmail } from "@/server/mail/mailer";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "@/server/security/password";
import { clearEvents, enforceLimit, recordEvent } from "@/server/security/rate-limit";
import { generateToken, hashToken } from "@/server/security/tokens";
import { runAfterResponse } from "@/server/runtime/after";
import type { Locale } from "@/i18n/config";
import type { PublicUser } from "@/shared/api-errors";
import { ROUTES } from "@/shared/routes";
import type { ChangePasswordInput, UpdateAccountInput } from "@/shared/validation/account";
import type { LoginInput, RegisterInput, ResetPasswordInput } from "@/shared/validation/auth";
import { createSession, revokeOtherSessions, type IssuedSession } from "./session.service";
import { createUser, findUserByEmail, toPublicUser, updateName } from "./user.repository";

const { limits } = AUTH_POLICY;

export interface AuthResult {
  user: PublicUser;
  session: IssuedSession;
}

/**
 * Registration. Input has already passed the shared schema; this re-checks nothing about shape but enforces
 * abuse limits, uniqueness (application check AND the database unique index) and stores an Argon2id hash.
 */
export async function register(input: RegisterInput, ip: string): Promise<AuthResult> {
  await enforceLimit("register-ip", ip, limits.registerPerIp);
  await recordEvent("register-ip", ip);

  // Hash first, check afterwards: a taken email then costs the same time as a free one.
  const passwordHash = await hashPassword(input.password);

  if (await findUserByEmail(input.email)) throw new ApiError("EMAIL_TAKEN", 409);

  let user;
  try {
    user = await createUser({ firstName: input.firstName, lastName: input.lastName, email: input.email, passwordHash });
  } catch (e) {
    // Lost a race with a concurrent registration: the unique index caught it.
    if (isUniqueViolation(e)) throw new ApiError("EMAIL_TAKEN", 409);
    throw e;
  }

  return { user: toPublicUser(user), session: await createSession(user.id) };
}

export async function login(input: LoginInput, ip: string): Promise<AuthResult> {
  const pairKey = `${input.email}|${ip}`;
  // Checked BEFORE the password is verified, so the limit also holds against a correct guess.
  await enforceLimit("login-fail", pairKey, limits.loginFailuresPerEmailAndIp);
  await enforceLimit("login-fail-ip", ip, limits.loginFailuresPerIp);

  const user = await findUserByEmail(input.email);
  const ok = user ? await verifyPassword(user.passwordHash, input.password) : (await verifyAgainstDummy(input.password), false);

  if (!user || !ok) {
    await recordEvent("login-fail", pairKey);
    await recordEvent("login-fail-ip", ip);
    // One answer for "no such account" and "wrong password".
    throw new ApiError("INVALID_CREDENTIALS", 401);
  }

  await clearEvents("login-fail", pairKey);
  return { user: toPublicUser(user), session: await createSession(user.id) };
}

/**
 * Always resolves the same way, whether or not the account exists. The email itself is sent after the response.
 */
export async function requestPasswordReset(email: string, ip: string, locale: Locale): Promise<void> {
  await enforceLimit("forgot-email", email, limits.forgotPerEmail);
  await enforceLimit("forgot-ip", ip, limits.forgotPerIp);
  // Counted whether or not the account exists, so the limiter reveals nothing either.
  await recordEvent("forgot-email", email);
  await recordEvent("forgot-ip", ip);

  const user = await findUserByEmail(email);
  if (!user) return;

  const token = generateToken();
  const db = getDb();
  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + AUTH_POLICY.resetToken.ttlMs),
      },
    }),
  ]);

  const t = getTranslator(locale);
  const url = `${getEnv().APP_URL}${ROUTES.resetPassword}?token=${encodeURIComponent(token)}`;
  runAfterResponse("password-reset-email", () =>
    sendEmail({
      to: user.email,
      subject: t("email.resetSubject"),
      text: t("email.resetBody", { name: user.firstName, url }),
    }),
  );
}

/** Single-use token; on success every session of the account is revoked. */
export async function resetPassword(input: ResetPasswordInput, ip: string): Promise<void> {
  await enforceLimit("reset-fail-ip", ip, limits.resetFailuresPerIp);

  const db = getDb();
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(input.token) } });
  if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
    await recordEvent("reset-fail-ip", ip);
    throw new ApiError("TOKEN_INVALID_OR_EXPIRED", 400);
  }

  const passwordHash = await hashPassword(input.newPassword);
  await db.$transaction(async (tx) => {
    // Claim the token atomically: of two concurrent requests only one can win.
    const claimed = await tx.passwordResetToken.updateMany({ where: { id: record.id, usedAt: null }, data: { usedAt: new Date() } });
    if (claimed.count !== 1) throw new ApiError("TOKEN_INVALID_OR_EXPIRED", 400);
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.session.deleteMany({ where: { userId: record.userId } });
    await tx.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } });
  });
}

/** Settings' Account Details form: First/Last Name only. Email is fixed and never accepted here. */
export async function updateAccount(userId: string, input: UpdateAccountInput): Promise<PublicUser> {
  return toPublicUser(await updateName(userId, input));
}

/**
 * Settings' Change Password. There is deliberately no currentPassword check here (an explicit product decision,
 * matching Finova's own Settings): any authenticated session for the account may change the password unilaterally.
 * Every OTHER session for this user is revoked on success; `currentToken` is the caller's own, so it is kept alive
 * — changing your password never signs you out of the device you did it from.
 */
export async function changePassword(userId: string, currentToken: string, input: ChangePasswordInput): Promise<void> {
  await enforceLimit("change-password", userId, limits.changePasswordPerUser);
  await recordEvent("change-password", userId);

  const passwordHash = await hashPassword(input.newPassword);
  await getDb().user.update({ where: { id: userId }, data: { passwordHash } });
  await revokeOtherSessions(userId, currentToken);
}
