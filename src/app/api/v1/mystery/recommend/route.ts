import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { listBooks } from "@/server/modules/books/book.repository";
import { createPick, listPickedSlugs } from "@/server/modules/mystery/mystery.repository";
import { findProfile } from "@/server/modules/profile/profile.repository";
import { buildReasoning, pickBook } from "@/server/mystery/recommend";
import { mysteryRecommendSchema, type MoodKey, type MysteryBookView } from "@/shared/validation/mystery";

/**
 * Runs the Mystery Book recommendation pipeline (Section 9) for the signed-in user and records the pick. For
 * `revealMode: "keep_mystery"`, the response never carries title/author/cover — withheld here, not just hidden
 * in the UI, since the whole point of that mode is that the book stays unidentifiable until it arrives.
 */
export const POST = route({ auth: true }, async (ctx) => {
  if (!ctx.user!.onboardingCompleted) throw new ApiError("FORBIDDEN", 403);
  const input = parseInput(mysteryRecommendSchema, await ctx.body());
  const userId = ctx.user!.id;

  const [profile, books, previousSlugs] = await Promise.all([findProfile(userId), listBooks(userId), listPickedSlugs(userId)]);
  // Guaranteed to exist once onboarding is completed, which the check above already requires.
  const book = pickBook(input, { profile: profile!, books, previousSlugs });
  if (!book) throw new ApiError("NO_MYSTERY_AVAILABLE", 503);

  const pickId = await createPick(userId, book.slug, input);

  const moods = input.moods as MoodKey[];
  const moodMatch = moods.reduce((total, m) => total + (book.moodProfile[m] ?? 0), 0) / moods.length;

  const revealed = input.revealMode === "show_now";
  const view: MysteryBookView = {
    genre: book.genre,
    moodMatch,
    approxPages: book.pages,
    title: revealed ? book.title : null,
    author: revealed ? book.author : null,
    coverUrl: revealed ? book.coverUrl : null,
  };

  return {
    status: 200,
    body: {
      pickId,
      revealMode: input.revealMode,
      book: view,
      reasoning: buildReasoning(ctx.locale, input),
    },
  };
});
