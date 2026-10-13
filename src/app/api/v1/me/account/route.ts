import { parseInput, route } from "@/server/http/route";
import { updateAccount } from "@/server/modules/auth/auth.service";
import { updateAccountSchema } from "@/shared/validation/account";

/** Settings' Account Details form: updates First/Last Name only. Returns the updated user (same shape as /session). */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(updateAccountSchema, await ctx.body());
  const user = await updateAccount(ctx.user!.id, input);
  return { status: 200, body: { user } };
});
