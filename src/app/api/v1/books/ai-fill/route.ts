import { lookUpBook } from "@/server/ai/book-lookup";
import { parseInput, route } from "@/server/http/route";
import { bookAiFillSchema } from "@/shared/validation/book";

/**
 * "Fill with AI": given a Title (and Author, if already typed), looks the book up on Google Books' free public
 * API to fill in Author/Genres/Plot, plus the main Characters when Open Library has catalogued them (never guessed).
 * `404 AI_NO_MATCH` when Google Books has no record of the title (nothing is ever fabricated for an unknown one).
 */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(bookAiFillSchema, await ctx.body());
  const result = await lookUpBook(input);
  return { status: 200, body: result };
});
