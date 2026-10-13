import { parseInput, route } from "@/server/http/route";
import { login } from "@/server/modules/auth/auth.service";
import { sessionCookie } from "@/server/modules/auth/cookie";
import { loginSchema } from "@/shared/validation/auth";

export const POST = route({}, async (ctx) => {
  const input = parseInput(loginSchema, await ctx.body());
  const { user, session } = await login(input, ctx.ip);
  return { status: 200, body: { user }, setCookies: [sessionCookie(session.token, session.expiresAt)] };
});
