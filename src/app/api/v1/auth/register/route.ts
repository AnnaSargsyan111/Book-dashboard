import { parseInput, route } from "@/server/http/route";
import { register } from "@/server/modules/auth/auth.service";
import { sessionCookie } from "@/server/modules/auth/cookie";
import { registerSchema } from "@/shared/validation/auth";

export const POST = route({}, async (ctx) => {
  const input = parseInput(registerSchema, await ctx.body());
  const { user, session } = await register(input, ctx.ip);
  // Registration signs the user in; the client continues to onboarding.
  return { status: 201, body: { user }, setCookies: [sessionCookie(session.token, session.expiresAt)] };
});
