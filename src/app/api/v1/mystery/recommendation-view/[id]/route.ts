import { ApiError } from "@/server/http/errors";
import { route } from "@/server/http/route";
import { deleteRecommendationView } from "@/server/modules/mystery/mystery.repository";

/** Mystery Book → Recently Recommended → the trash icon: removes one card from the list. 404 for someone else's
 *  id the same way `findRecommendationView` would, so ownership is never distinguishable from "doesn't exist" by
 *  a guessed id — see `deleteRecommendationView`'s own doc comment for what this does and doesn't touch. */
export const DELETE = route({ auth: true }, async (ctx) => {
  const removed = await deleteRecommendationView(ctx.user!.id, ctx.params.id!);
  if (!removed) throw new ApiError("NOT_FOUND", 404);
  return { status: 204 };
});
