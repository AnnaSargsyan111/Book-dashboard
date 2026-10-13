import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { listBooks } from "@/server/modules/books/book.repository";
import { listPickedSlugs, recordRecommendationView } from "@/server/modules/mystery/mystery.repository";
import { findProfile } from "@/server/modules/profile/profile.repository";
import { buildReasoning, pickBook } from "@/server/mystery/recommend";
import { mysteryPreviewSchema, type MoodKey, type MysteryBookView } from "@/shared/validation/mystery";

/**
 * "Show Me Now" candidate browsing: computes and returns a book like `/mystery/recommend` does, but never calls
 * `createPick` — a candidate the user sees here and moves past (up to `LIMITS.mysteryRerollMax` times) stays
 * eligible for a future session, since nothing is written to `MysteryPick` until `/mystery/recommend/commit`.
 * `excludeSlugs` (this round's own already-seen candidates) is added on top of the caller's permanent history so
 * a reroll never repeats one already shown. Every candidate returned here IS recorded in
 * `MysteryRecommendationView` ("Recently Recommended" — Mystery Book page redesign) — a display-only log,
 * entirely separate from `MysteryPick`'s own exclusion list, so this still doesn't affect future eligibility.
 */
export const POST = route({ auth: true }, async (ctx) => {
  if (!ctx.user!.onboardingCompleted) throw new ApiError("FORBIDDEN", 403);
  const input = parseInput(mysteryPreviewSchema, await ctx.body());
  const userId = ctx.user!.id;

  const [profile, books, previousSlugs] = await Promise.all([findProfile(userId), listBooks(userId), listPickedSlugs(userId)]);
  for (const slug of input.excludeSlugs ?? []) previousSlugs.add(slug);

  const recommendInput = { moods: input.moods, genres: input.genres, experience: input.experience, revealMode: "show_now" as const };
  const book = pickBook(recommendInput, { profile: profile!, books, previousSlugs });
  if (!book) throw new ApiError("NO_MYSTERY_AVAILABLE", 503);

  const moods = input.moods as MoodKey[];
  const moodMatch = moods.reduce((total, m) => total + (book.moodProfile[m] ?? 0), 0) / moods.length;
  const view: MysteryBookView = { genre: book.genre, moodMatch, approxPages: book.pages, title: book.title, author: book.author, coverUrl: book.coverUrl };

  await recordRecommendationView(userId, book.slug, moods, input.experience);

  return { status: 200, body: { bookSlug: book.slug, book: view, reasoning: buildReasoning(ctx.locale, recommendInput) } };
});
