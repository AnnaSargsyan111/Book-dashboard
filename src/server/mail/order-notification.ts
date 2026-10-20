import { getEnv } from "@/server/config/env";
import type { RevealMode } from "@/shared/validation/mystery";
import { C, coverBlock, detailRow, emailShell, esc, orderCard, orderTotal, SANS, SERIF } from "./email-layout";
import { sendEmail, type EmailMessage } from "./mailer";

interface OrderNotificationInput {
  firstName: string;
  lastName: string;
  address: { addressLine1: string | null; addressLine2: string | null; city: string | null; region: string | null; postalCode: string | null; country: string | null };
  book: { title: string; author: string; coverUrl: string | null };
  revealMode: RevealMode;
}

/** The owner's email is in Armenian only. */
const COPY = {
  subject: (mode: string) => `Գրքի պատվեր (${mode})`,
  modes: { keep_mystery: "Թող մնա առեղծված", show_now: "Ցույց տվեք հիմա" } as Record<RevealMode, string>,
  tagline: "ԱՇԽԱՐՀ ԿԱԶՄԵՐԻ ՄԻՋԵՎ",
  eyebrow: "ՆՈՐ ՊԱՏՎԵՐ",
  greeting: "Հարգելի Աննա,",
  intro: "Համակարգում գրանցվել է նոր պատվեր՝",
  selectedBook: "ԸՆՏՐՎԱԾ ԳԻՐՔԸ",
  by: (author: string) => `Հեղինակ՝ ${author}`,
  nameSurname: "ԱՆՈՒՆ ԱԶԳԱՆՈՒՆ",
  orderLocation: "ՊԱՏՎԵՐԻ ՎԱՅՐԸ",
  price: "ԳԻՆ",
  withLove: "Ձեր սիրելի",
  team: "MystBook-ը",
  footer: "Մի քիչ առեղծված։ Շատ պատմություններ։",
} as const;

/**
 * Builds the owner's order email (subject + plain text + the same HTML design as the customer's). It shows the real
 * book — title, author and cover — even for "Keep it a mystery": this one is for the owner, never for the customer —
 * with the chosen mode in parentheses next to the title.
 */
export function buildOrderEmail(input: OrderNotificationInput): Pick<EmailMessage, "subject" | "text" | "html"> {
  const c = COPY;
  const mode = c.modes[input.revealMode];
  const { address } = input;
  const location = [address.addressLine1, address.addressLine2, address.city, address.region, address.postalCode, address.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const price = orderTotal();
  const titleWithMode = `${input.book.title} (${mode})`;
  const subject = c.subject(mode);

  const text = [
    c.greeting,
    "",
    c.intro,
    `${c.nameSurname}: ${fullName}`,
    `${c.orderLocation}: ${location}`,
    `${c.price}: ${price}`,
    `${c.selectedBook}: ${titleWithMode}`,
    "",
    `${c.withLove} ${c.team}`,
  ].join("\n");

  const summary = `
            <div style="font-size:13px;letter-spacing:1px;color:${C.muted};">${esc(c.selectedBook)}</div>
            <div style="font-size:24px;line-height:1.25;color:${C.ink};padding-top:8px;">${esc(input.book.title)}</div>
            <div style="font-size:17px;color:${C.muted};padding-top:6px;">${esc(c.by(input.book.author))}</div>
            <div style="font-size:15px;color:${C.muted};padding-top:6px;">(${esc(mode)})</div>
            <div style="font-size:12px;letter-spacing:1px;color:${C.muted};padding-top:14px;">${esc(c.price)}</div>
            <div style="font-size:26px;font-weight:600;color:${C.ink};padding-top:2px;">${esc(price)}</div>`;
  const rows = `${detailRow(c.nameSurname, fullName, "&#128100;")}${detailRow(c.orderLocation, location, "&#128205;")}`;

  const middle = `
    <tr><td style="padding:30px 30px 8px 30px;font-family:${SANS};">
      <div style="font-size:14px;letter-spacing:1px;color:${C.muted};">${esc(c.eyebrow)}</div>
      <div style="font-size:24px;color:${C.ink};padding-top:18px;">${esc(c.greeting)}</div>
      <div style="font-size:17px;line-height:1.65;color:#1f1f1f;padding-top:14px;">${esc(c.intro)}</div>
      <div style="border-top:1px solid ${C.rule};margin-top:22px;"></div>
    </td></tr>${orderCard(coverBlock(input.book.coverUrl), summary, rows)}
    <tr><td align="center" style="padding:22px 30px 26px 30px;">
      <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:${C.ink};">${esc(c.withLove)}</div>
      <div style="font-family:${SANS};font-size:22px;color:${C.ink};padding-top:6px;">${esc(c.team)}</div>
    </td></tr>`;

  return { subject, text, html: emailShell({ lang: "hy", title: subject, tagline: c.tagline, footer: c.footer, middle }) };
}

/**
 * Tells the owner a Mystery Book order was placed. The recipient comes from `ORDER_NOTIFICATION_EMAIL`; when it
 * isn't set nothing is sent (so a missing setting never breaks ordering). A mail problem is logged by `sendEmail`
 * and never reaches the caller — the customer's order has already been recorded and must stay placed.
 */
export async function sendOrderNotification(input: OrderNotificationInput): Promise<void> {
  const to = getEnv().ORDER_NOTIFICATION_EMAIL?.trim();
  if (!to) return;
  await sendEmail({ to, ...buildOrderEmail(input) });
}
