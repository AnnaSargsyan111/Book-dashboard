import { ApiError } from "@/server/http/errors";
import { parseInput, route } from "@/server/http/route";
import { sendCustomerOrderEmail } from "@/server/mail/customer-order-email";
import { sendOrderNotification } from "@/server/mail/order-notification";
import { findPick, markOrdered } from "@/server/modules/mystery/mystery.repository";
import { CATALOG } from "@/server/mystery/catalog";
import { mysteryOrderSchema, type RevealMode } from "@/shared/validation/mystery";

/**
 * Places the order (Payment step, MVP): records a payment method and marks the pick ordered. No real gateway —
 * nothing here collects card details or moves money. Re-checks the picked book's availability first (Section
 * 13.26 "Out-of-Stock State") since time may have passed since the recommendation; `409 BOOK_OUT_OF_STOCK` sends
 * the UI to its own screen rather than a generic error. Requires a delivery address already on file. Once the
 * order is recorded, an email about it goes to `ORDER_NOTIFICATION_EMAIL` and a confirmation to the customer.
 */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(mysteryOrderSchema, await ctx.body());
  const pick = await findPick(ctx.user!.id, ctx.params.id!);
  if (!pick) throw new ApiError("NOT_FOUND", 404);
  if (!pick.addressLine1) throw new ApiError("VALIDATION_ERROR", 400);

  const book = CATALOG.find((b) => b.slug === pick.bookSlug);
  if (!book || !book.available) throw new ApiError("BOOK_OUT_OF_STOCK", 409);

  await markOrdered(pick.id, input.paymentMethod);

  // Two emails go out for every placed order: one to the owner (plain details) and one to the customer, in the
  // language they are using the site in. Sending never fails the request (see `sendEmail`).
  const revealMode = pick.revealMode as RevealMode;
  await Promise.all([
    sendOrderNotification({
      firstName: ctx.user!.firstName,
      lastName: ctx.user!.lastName,
      address: pick,
      bookTitle: book.title,
      revealMode,
    }),
    sendCustomerOrderEmail(
      {
        to: ctx.user!.email,
        firstName: ctx.user!.firstName,
        lastName: ctx.user!.lastName,
        address: pick,
        revealMode,
        book: { title: book.title, author: book.author, coverUrl: book.coverUrl },
      },
      ctx.locale,
    ),
  ]);
  return { status: 200, body: { ok: true } };
});
