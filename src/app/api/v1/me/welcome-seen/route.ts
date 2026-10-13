import { route } from "@/server/http/route";
import { markWelcomeModalSeen, toPublicUser } from "@/server/modules/auth/user.repository";

/**
 * Marks the one-time Welcome Modal as seen for the signed-in user, so it never appears again. Idempotent: calling
 * it again (a double click, a retry) is harmless.
 */
export const POST = route({ auth: true }, async (ctx) => {
  const user = await markWelcomeModalSeen(ctx.user!.id);
  return { status: 200, body: { user: toPublicUser(user) } };
});
