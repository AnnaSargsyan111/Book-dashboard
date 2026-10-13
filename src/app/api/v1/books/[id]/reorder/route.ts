import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { swapBookOrder } from "@/server/modules/books/book.repository";
import { bookReorderSchema } from "@/shared/validation/book";

/**
 * Dragging a library card onto another one (Books page, 2+ books only): swaps the dragged book's position with
 * the one it was dropped on. `swapBookOrder` is itself ownership-scoped (both ids must belong to the caller), so
 * an unknown or foreign `targetId` just comes back as a no-op rather than an error.
 */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(bookReorderSchema, await ctx.body());
  const userId = ctx.user!.id;
  const bookId = ctx.params.id!;

  if (bookId === input.targetId) throw new ApiError("VALIDATION_ERROR", 400);

  const moved = await swapBookOrder(userId, bookId, input.targetId);
  return { status: 200, body: { moved } };
});
