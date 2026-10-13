import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { saveAddress } from "@/server/modules/mystery/mystery.repository";
import { mysteryAddressSchema } from "@/shared/validation/mystery";

/** Attaches a delivery address to an already-generated pick — the step shown after the result screen's own
 *  CTA, required before an order can be placed. `404` for a missing pick and someone else's alike. */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(mysteryAddressSchema, await ctx.body());
  const saved = await saveAddress(ctx.user!.id, ctx.params.id!, input);
  if (!saved) throw new ApiError("NOT_FOUND", 404);
  return { status: 200, body: { ok: true } };
});
