import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { listBooks } from "@/server/modules/books/book.repository";
import { createPick, listPickedSlugs, recordRecommendationView } from "@/server/modules/mystery/mystery.repository";
import { findProfile } from "@/server/modules/profile/profile.repository";
import { CATALOG } from "@/server/mystery/catalog";
import { buildReasoning, isEligible } from "@/server/mystery/recommend";
import { mysteryCommitSchema, type MoodKey, type MysteryBookView } from "@/shared/validation/mystery";

/**
 * Finalizes one previewed "Show Me Now" candidate: the only point such a pick is actually written to
 * `MysteryPick` (the row that drives the address/payment/order steps and future-eligibility exclusion).
 * Re-validates `bookSlug` against the same eligibility filters `/mystery/recommend/preview` used (available, not
 * already recommended, not already owned) rather than trusting the client outright, but does not re-run ranking
 * — it must persist exactly the book the caller is looking at, not a freshly re-scored one. Also records a
 * `MysteryRecommendationView` (defense-in-depth: normally already recorded by the preview call that revealed
 * this exact candidate, so this is a no-op in the ordinary case).
 */
export const POST = route({ auth: true }, async (ctx) => {
  if (!ctx.user!.onboardingCompleted) throw new ApiError("FORBIDDEN", 403);
  const input = parseInput(mysteryCommitSchema, await ctx.body());
  const userId = ctx.user!.id;

  const [profile, books, previousSlugs] = await Promise.all([findProfile(userId), listBooks(userId), listPickedSlugs(userId)]);
  const book = CATALOG.find((b) => b.slug === input.bookSlug);
  if (!book || !isEligible(book, { profile: profile!, books, previousSlugs })) throw new ApiError("NO_MYSTERY_AVAILABLE", 503);

  const recommendInput = { moods: input.moods, genres: input.genres, experience: input.experience, revealMode: "show_now" as const };
  const moods = input.moods as MoodKey[];
  const [pickId] = await Promise.all([createPick(userId, book.slug, recommendInput), recordRecommendationView(userId, book.slug, moods, input.experience)]);

  const moodMatch = moods.reduce((total, m) => total + (book.moodProfile[m] ?? 0), 0) / moods.length;
  const view: MysteryBookView = { genre: book.genre, moodMatch, approxPages: book.pages, title: book.title, author: book.author, coverUrl: book.coverUrl };

  return { status: 200, body: { pickId, revealMode: "show_now", book: view, reasoning: buildReasoning(ctx.locale, recommendInput) } };
});
