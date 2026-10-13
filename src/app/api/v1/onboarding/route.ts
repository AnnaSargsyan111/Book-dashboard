import { parseInput, route } from "@/server/http/route";
import { completeOnboarding } from "@/server/modules/onboarding/onboarding.service";
import { onboardingSchema } from "@/shared/validation/onboarding";

/** Completes onboarding for the signed-in user. Returns the updated user (onboardingCompleted: true). */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(onboardingSchema, await ctx.body());
  const user = await completeOnboarding(ctx.user!.id, input);
  return { status: 200, body: { user } };
});
