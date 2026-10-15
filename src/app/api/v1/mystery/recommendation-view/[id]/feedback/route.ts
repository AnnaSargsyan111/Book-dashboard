import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { saveViewFeedback } from "@/server/modules/mystery/mystery.repository";
import { mysteryFeedbackSchema } from "@/shared/validation/mystery";

/** Recently Recommended → the review icon on an "Added to My Books" card. Same rating + tags body as the pick's own
 *  feedback. `404` for a missing view, someone else's, and one that hasn't been added to the library yet alike;
 *  `409 ALREADY_REVIEWED` once a review exists (it is left once, then locked). */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(mysteryFeedbackSchema, await ctx.body());
  const result = await saveViewFeedback(ctx.user!.id, ctx.params.id!, input);
  if (result === "not_found") throw new ApiError("NOT_FOUND", 404);
  if (result === "already_reviewed") throw new ApiError("ALREADY_REVIEWED", 409);
  return { status: 200, body: { ok: true } };
});
