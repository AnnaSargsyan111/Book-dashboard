import { route } from "@/server/http/route";

/** The signed-in user, or 401. The frontend uses this to confirm a session. */
export const GET = route({ auth: true }, async (ctx) => ({ status: 200, body: { user: ctx.user } }));
