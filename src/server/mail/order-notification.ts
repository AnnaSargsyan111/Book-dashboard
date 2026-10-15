import { getEnv } from "@/server/config/env";
import { DELIVERY_FEE_AMD, MYSTERY_BOOK_PRICE_AMD, type RevealMode } from "@/shared/validation/mystery";
import { sendEmail } from "./mailer";

interface OrderNotificationInput {
  firstName: string;
  lastName: string;
  address: { addressLine1: string | null; addressLine2: string | null; city: string | null; region: string | null; postalCode: string | null; country: string | null };
  bookTitle: string;
  revealMode: RevealMode;
}

/** The exact words used for the two modes, in the subject and next to the book's name. */
const MODE_LABEL: Record<RevealMode, string> = { keep_mystery: "Keep it a mystery", show_now: "Show me now" };

/** Same format as the payment step: "9,400 ֏". */
const formatAmd = (amount: number) => `${amount.toLocaleString("en-US")} ֏`;

/** Builds the order email (subject + plain-text body). Kept separate from sending so it can be checked on its own. */
export function buildOrderEmail(input: OrderNotificationInput): { subject: string; text: string } {
  const mode = MODE_LABEL[input.revealMode];
  const { address } = input;
  const location = [address.addressLine1, address.addressLine2, address.city, address.region, address.postalCode, address.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  const text = [
    "Dear Anna,",
    "",
    "A new order has been registered in the system:",
    `Name Surname: ${input.firstName} ${input.lastName}`,
    `Order location: ${location}`,
    `Price: ${formatAmd(MYSTERY_BOOK_PRICE_AMD + DELIVERY_FEE_AMD)}`,
    `Selected book: ${input.bookTitle} (${mode})`,
    "",
    "Your beloved MystBook",
  ].join("\n");

  return { subject: `Book order (${mode})`, text };
}

/**
 * Tells the owner a Mystery Book order was placed. The recipient comes from `ORDER_NOTIFICATION_EMAIL`; when it
 * isn't set nothing is sent (so a missing setting never breaks ordering). A mail problem is logged by
 * `sendEmail` and never reaches the caller — the customer's order has already been recorded and must stay placed.
 * The email shows the real title even for "Keep it a mystery": it is for the owner, never for the customer.
 */
export async function sendOrderNotification(input: OrderNotificationInput): Promise<void> {
  const to = getEnv().ORDER_NOTIFICATION_EMAIL?.trim();
  if (!to) return;
  await sendEmail({ to, ...buildOrderEmail(input) });
}
