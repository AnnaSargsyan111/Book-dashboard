import { parseInput, route } from "@/server/http/route";
import { changePassword } from "@/server/modules/auth/auth.service";
import { changePasswordSchema } from "@/shared/validation/account";

/**
 * Settings' Change Password. No currentPassword field by design (see `changePassword()`). Every OTHER session for
 * this user is revoked on success; the caller's own session (its cookie is right here on the request) stays valid.
 */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(changePasswordSchema, await ctx.body());
  await changePassword(ctx.user!.id, ctx.sessionToken!, input);
  return { status: 200, body: { ok: true } };
});
