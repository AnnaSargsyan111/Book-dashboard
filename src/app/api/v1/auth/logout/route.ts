import { route } from "@/server/http/route";
import { clearedSessionCookie } from "@/server/modules/auth/cookie";
import { revokeSession } from "@/server/modules/auth/session.service";

/** Idempotent: signing out twice, or without a session, is fine. */
export const POST = route({}, async (ctx) => {
  if (ctx.sessionToken) await revokeSession(ctx.sessionToken);
  return { status: 204, setCookies: [clearedSessionCookie()] };
});
