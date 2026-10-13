import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { createBook, findBookByRecommendationView } from "@/server/modules/books/book.repository";
import { findRecommendationView } from "@/server/modules/mystery/mystery.repository";
import { CATALOG } from "@/server/mystery/catalog";
import { bookSchema } from "@/shared/validation/book";

/**
 * Mystery Book → Recently Recommended → "+ Add" → Book Detail → Save (Section 8/9): the one point a recommended
 * book actually becomes a library entry. Reuses `bookSchema` unchanged (the same contract the ordinary Add Book
 * form sends) — only the cover and the link back to the recommendation come from the server's own catalog
 * lookup, never from the client. Idempotent: pressing Save twice (or the card's state lagging a beat) returns
 * the same book rather than erroring, since `Book.sourceMysteryViewId` is unique and the user never sees two
 * "+ Add" clicks as two different actions.
 */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(bookSchema, await ctx.body());
  const userId = ctx.user!.id;
  const viewId = ctx.params.id!;

  const view = await findRecommendationView(userId, viewId);
  if (!view) throw new ApiError("NOT_FOUND", 404);

  const existing = await findBookByRecommendationView(viewId);
  if (existing) return { status: 200, body: { book: existing } };

  const catalogBook = CATALOG.find((b) => b.slug === view.bookSlug);
  const book = await createBook(userId, input, { viewId, coverUrl: catalogBook?.coverUrl ?? null });
  return { status: 201, body: { book } };
});
