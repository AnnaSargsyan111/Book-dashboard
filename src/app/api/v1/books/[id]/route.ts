import { parseInput, route } from "@/server/http/route";
import { ApiError } from "@/server/http/errors";
import { deleteBook, updateBook } from "@/server/modules/books/book.repository";
import { bookSchema } from "@/shared/validation/book";

/** Saves every field in place — Book Detail has no separate edit mode, so this is a full replace of the same
 *  shape POST /api/v1/books accepts. 404 for a missing book and someone else's book alike, so ownership is
 *  never distinguishable from "doesn't exist" by a guessed id. */
export const PATCH = route({ auth: true }, async (ctx) => {
  const input = parseInput(bookSchema, await ctx.body());
  const book = await updateBook(ctx.user!.id, ctx.params.id!, input);
  if (!book) throw new ApiError("NOT_FOUND", 404);
  return { status: 200, body: { book } };
});

/** Permanently removes the book (and its cover file, if it had a locally-uploaded one). */
export const DELETE = route({ auth: true }, async (ctx) => {
  const removed = await deleteBook(ctx.user!.id, ctx.params.id!);
  if (!removed) throw new ApiError("NOT_FOUND", 404);
  return { status: 204 };
});
