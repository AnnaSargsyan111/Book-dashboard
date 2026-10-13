import "server-only";
import { redirect } from "next/navigation";
import type { PublicUser } from "@/shared/api-errors";
import { homePathFor, ROUTES } from "@/shared/routes";
import { getCurrentUser } from "./current-user";

/** For pages that need a signed-in user. Everyone else goes to sign-in. */
export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);
  return user;
}

/** For the app proper (Books and everything after it): signed in AND onboarding finished, else back to the gate. */
export async function requireOnboardedUser(): Promise<PublicUser> {
  const user = await requireUser();
  if (!user.onboardingCompleted) redirect(ROUTES.onboarding);
  return user;
}

/** For auth pages: someone who is already signed in has no use for them. */
export async function redirectIfSignedIn(): Promise<void> {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user));
}
