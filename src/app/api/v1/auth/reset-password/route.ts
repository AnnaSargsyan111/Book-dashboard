import { parseInput, route } from "@/server/http/route";
import { resetPassword } from "@/server/modules/auth/auth.service";
import { resetPasswordSchema } from "@/shared/validation/auth";

export const POST = route({}, async (ctx) => {
  const input = parseInput(resetPasswordSchema, await ctx.body());
  await resetPassword(input, ctx.ip);
  return { status: 200, body: { ok: true } };
});
