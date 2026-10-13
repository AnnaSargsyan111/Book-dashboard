import { parseInput, route } from "@/server/http/route";
import { createBook, listBooks } from "@/server/modules/books/book.repository";
import { bookSchema } from "@/shared/validation/book";

/** The signed-in user's library, newest first. */
export const GET = route({ auth: true }, async (ctx) => {
  const books = await listBooks(ctx.user!.id);
  return { status: 200, body: { books } };
});

/** Adds one book to the signed-in user's library. */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(bookSchema, await ctx.body());
  const book = await createBook(ctx.user!.id, input);
  return { status: 201, body: { book } };
});
