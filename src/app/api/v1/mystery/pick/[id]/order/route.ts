import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { sendOrderNotification } from "@/server/mail/order-notification";
import { findPick, markOrdered } from "@/server/modules/mystery/mystery.repository";
import { CATALOG } from "@/server/mystery/catalog";
import { mysteryOrderSchema, type RevealMode } from "@/shared/validation/mystery";

/**
 * Places the order (Payment step, MVP): records a payment method and marks the pick ordered. No real gateway —
 * nothing here collects card details or moves money. Re-checks the picked book's availability first (Section
 * 13.26 "Out-of-Stock State") since time may have passed since the recommendation; `409 BOOK_OUT_OF_STOCK` sends
 * the UI to its own screen rather than a generic error. Requires a delivery address already on file. Once the
 * order is recorded, an email about it goes to `ORDER_NOTIFICATION_EMAIL`.
 */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(mysteryOrderSchema, await ctx.body());
  const pick = await findPick(ctx.user!.id, ctx.params.id!);
  if (!pick) throw new ApiError("NOT_FOUND", 404);
  if (!pick.addressLine1) throw new ApiError("VALIDATION_ERROR", 400);

  const book = CATALOG.find((b) => b.slug === pick.bookSlug);
  if (!book || !book.available) throw new ApiError("BOOK_OUT_OF_STOCK", 409);

  await markOrdered(pick.id, input.paymentMethod);

  // The owner is told about every placed order. Sending never fails the request (see `sendOrderNotification`).
  await sendOrderNotification({
    firstName: ctx.user!.firstName,
    lastName: ctx.user!.lastName,
    address: pick,
    bookTitle: book.title,
    revealMode: pick.revealMode as RevealMode,
  });
  return { status: 200, body: { ok: true } };
});
