import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { updateProfile } from "@/server/modules/profile/profile.repository";
import { profileUpdateSchema } from "@/shared/validation/profile";

/**
 * Updates the signed-in user's editable About Me profile (genres, favorite authors, About Me text — each
 * independently clearable). Requires onboarding to be finished: that is what guarantees the row exists.
 */
export const POST = route({ auth: true }, async (ctx) => {
  if (!ctx.user!.onboardingCompleted) throw new ApiError("FORBIDDEN", 403);
  const input = parseInput(profileUpdateSchema, await ctx.body());
  const profile = await updateProfile(ctx.user!.id, input);
  return { status: 200, body: { profile } };
});
