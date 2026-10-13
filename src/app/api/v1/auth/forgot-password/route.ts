import { parseInput, route } from "@/server/http/route";
import { requestPasswordReset } from "@/server/modules/auth/auth.service";
import { forgotPasswordSchema } from "@/shared/validation/auth";

/** Always 202 with the same body, whether or not the email belongs to an account. */
export const POST = route({}, async (ctx) => {
  const input = parseInput(forgotPasswordSchema, await ctx.body());
  await requestPasswordReset(input.email, ctx.ip, ctx.locale);
  return { status: 202, body: { message: ctx.t("auth.forgot.sentBody") } };
});
