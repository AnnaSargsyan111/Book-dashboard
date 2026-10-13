import { ApiError } from "@/server/http/errors";
import { route } from "@/server/http/route";
import { saveCoverUpload } from "@/server/files/cover-storage";
import { getBook, setBookCover } from "@/server/modules/books/book.repository";

/** "Add Photo": a multipart upload, so this bypasses `ctx.body()` (JSON-only) and reads the form itself. Auth
 *  and the CSRF origin check from the route factory still apply before we get here. */
export const POST = route({ auth: true }, async (ctx) => {
  const book = await getBook(ctx.user!.id, ctx.params.id!);
  if (!book) throw new ApiError("NOT_FOUND", 404);

  const form = await ctx.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError("VALIDATION_ERROR", 400);

  const coverUrl = await saveCoverUpload(ctx.user!.id, book.id, file);
  const updated = await setBookCover(ctx.user!.id, book.id, coverUrl);
  return { status: 200, body: { book: updated } };
});
