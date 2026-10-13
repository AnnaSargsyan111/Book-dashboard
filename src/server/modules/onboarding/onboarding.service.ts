import { getDb } from "@/server/db/client";
import { ApiError } from "@/server/http/errors";
import { toPublicUser } from "@/server/modules/auth/user.repository";
import type { PublicUser } from "@/shared/api-errors";
import type { OnboardingInput } from "@/shared/validation/onboarding";

/**
 * Finishes the mandatory onboarding step: saves the profile answers and flips `onboardingCompleted` in ONE
 * transaction, so a user can never be "completed" without a profile (or the reverse).
 *
 * The flag is claimed with a conditional update, so two concurrent submissions cannot both succeed and a user who
 * already finished gets a clean 409 instead of overwriting their profile (later edits belong to About Me).
 */
export async function completeOnboarding(userId: string, input: OnboardingInput): Promise<PublicUser> {
  return getDb().$transaction(async (tx) => {
    const claimed = await tx.user.updateMany({ where: { id: userId, onboardingCompleted: false }, data: { onboardingCompleted: true } });
    if (claimed.count !== 1) throw new ApiError("ONBOARDING_ALREADY_COMPLETED", 409);

    await tx.userProfile.create({
      data: { userId, genres: input.genres, favoriteAuthors: input.favoriteAuthors, aboutMe: input.aboutMe },
    });

    return toPublicUser(await tx.user.findUniqueOrThrow({ where: { id: userId } }));
  });
}
