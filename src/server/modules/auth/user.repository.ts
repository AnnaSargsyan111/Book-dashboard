import type { User } from "@/generated/prisma/client";
import { getDb } from "@/server/db/client";
import type { PublicUser } from "@/shared/api-errors";

/** Everything that touches the User table lives here. Services never build queries themselves. */

export function toPublicUser(
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "onboardingCompleted" | "welcomeModalSeen">,
): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    onboardingCompleted: user.onboardingCompleted,
    welcomeModalSeen: user.welcomeModalSeen,
  };
}

export const findUserByEmail = (email: string) => getDb().user.findUnique({ where: { email } });

export const findUserById = (id: string) => getDb().user.findUnique({ where: { id } });

export const createUser = (data: { firstName: string; lastName: string; email: string; passwordHash: string }) =>
  getDb().user.create({ data });

/** Idempotent: marks the one-time Welcome Modal as seen. Safe to call more than once. */
export const markWelcomeModalSeen = (id: string) => getDb().user.update({ where: { id }, data: { welcomeModalSeen: true } });

/** Settings' Account Details form. Email is never touched here. */
export const updateName = (id: string, data: { firstName: string; lastName: string }) =>
  getDb().user.update({ where: { id }, data: { firstName: data.firstName, lastName: data.lastName } });
