import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { saveFeedback } from "@/server/modules/mystery/mystery.repository";
import { mysteryFeedbackSchema } from "@/shared/validation/mystery";

/** Post-Delivery Feedback — optional, ownership-scoped like the address step. `404` for a missing pick and
 *  someone else's alike. Not yet fed back into the recommendation engine's scoring (see README). */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(mysteryFeedbackSchema, await ctx.body());
  const saved = await saveFeedback(ctx.user!.id, ctx.params.id!, input);
  if (!saved) throw new ApiError("NOT_FOUND", 404);
  return { status: 200, body: { ok: true } };
});
