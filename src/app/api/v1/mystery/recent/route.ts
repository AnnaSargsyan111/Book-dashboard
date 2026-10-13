import { route } from "@/server/http/route";
import { listRecommendationViews } from "@/server/modules/mystery/mystery.repository";
import { CATALOG } from "@/server/mystery/catalog";
import { buildReasoning } from "@/server/mystery/recommend";
import type { MysteryRecentRecommendation } from "@/shared/validation/mystery";

/**
 * Mystery Book → "Recently Recommended": every "Show Me Now" catalog title this user has ever been shown —
 * whether they ultimately committed to it or just looked at it via "Try Another Book" — newest first. "Keep the
 * Mystery" picks never appear here (`MysteryRecommendationView` rows are only ever written for "Show Me Now"
 * candidates — see that model's own schema comment). The reasoning text isn't stored (only the answers that
 * produced it are); `buildReasoning` is pure given those same answers, so it's rebuilt here rather than
 * duplicating storage for a derivable value.
 */
export const GET = route({ auth: true }, async (ctx) => {
  const views = await listRecommendationViews(ctx.user!.id);
  const recommendations: MysteryRecentRecommendation[] = views.flatMap((view) => {
    const book = CATALOG.find((b) => b.slug === view.bookSlug);
    if (!book) return [];
    return [
      {
        viewId: view.id,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        genre: book.genre,
        reasoning: buildReasoning(ctx.locale, { moods: view.moods, experience: view.experience ?? undefined, revealMode: "show_now" }),
        createdAt: view.createdAt.toISOString(),
        libraryBookId: view.libraryBookId,
      },
    ];
  });
  return { status: 200, body: { recommendations } };
});
