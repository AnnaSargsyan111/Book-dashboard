import { ApiError } from "@/server/http/errors";
import { route } from "@/server/http/route";
import { lookUpCover } from "@/server/ai/cover-lookup";
import { getBook, setBookCover } from "@/server/modules/books/book.repository";

/** "Find cover": looks the book up by its own saved title/author (Google Books, no request body needed) and
 *  sets the cover when found. */
export const POST = route({ auth: true }, async (ctx) => {
  const book = await getBook(ctx.user!.id, ctx.params.id!);
  if (!book) throw new ApiError("NOT_FOUND", 404);

  const coverUrl = await lookUpCover(book.title, book.author);
  const updated = await setBookCover(ctx.user!.id, book.id, coverUrl);
  return { status: 200, body: { book: updated } };
});
