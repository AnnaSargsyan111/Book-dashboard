import type { RevealMode } from "@/shared/validation/mystery";
import { C, coverBlock, detailRow, emailShell, esc, orderCard, orderTotal, SANS, SERIF } from "./email-layout";
import { sendEmail, type EmailMessage } from "./mailer";

type Locale = "en" | "hy";

export interface CustomerOrderEmailInput {
  /** The customer's registered email — where this goes. */
  to: string;
  firstName: string;
  lastName: string;
  address: { city: string | null; region: string | null; country: string | null };
  revealMode: RevealMode;
  /** Only used for "Show me now": a "Keep it a mystery" email never carries the title, author or cover. */
  book: { title: string; author: string; coverUrl: string | null };
}

const COPY = {
  en: {
    subject: "Your MystBook Order Is on Its Way ✨",
    tagline: "A WORLD BETWEEN THE COVERS",
    eyebrow: "A NEW CHAPTER BEGINS",
    greeting: (name: string) => `Dear ${name},`,
    intro: "Your next literary journey is one step closer. Your new book is on the way and we're delighted to have you with us.",
    selectedBook: "YOUR SELECTED BOOK",
    by: (author: string) => `by ${author}`,
    mysteryTitle: "A Mystery Book",
    mysterySub: "Revealed when it arrives",
    orderedBy: "ORDERED BY",
    orderLocation: "ORDER LOCATION",
    orderStatus: "ORDER STATUS",
    onTheWay: "On the way",
    door: "Every book opens a door to another world",
    thanks: "Thank you for choosing MystBook. We're happy to be part of your reading journey.",
    withLove: "With love,",
    team: "Your MystBook Team",
    contact: "Please call to get in touch.",
    footer: "A little mystery. A lot of stories.",
  },
  hy: {
    subject: "Ձեր MystBook պատվերը ճանապարհին է ✨",
    tagline: "ԱՇԽԱՐՀ ԿԱԶՄԵՐԻ ՄԻՋԵՎ",
    eyebrow: "ՆՈՐ ԳԼՈՒԽ Է ՍԿՍՎՈՒՄ",
    greeting: (name: string) => `Հարգելի ${name},`,
    intro: "Ձեր հաջորդ գրական ճանապարհորդությունը մեկ քայլով ավելի մոտ է։ Ձեր պատվերը ճանապարհին է, և մենք ուրախ ենք, որ Դուք մեզ եք ընտրել։",
    selectedBook: "ՁԵՐ ԸՆՏՐԱԾ ԳԻՐՔԸ",
    by: (author: string) => `Հեղինակ՝ ${author}`,
    mysteryTitle: "Առեղծվածային գիրք",
    mysterySub: "Կբացահայտեք առեղծված, երբ ստանաք գիրքը",
    orderedBy: "ՊԱՏՎԻՐԵԼ Է",
    orderLocation: "ՊԱՏՎԵՐԻ ՎԱՅՐԸ",
    orderStatus: "ՊԱՏՎԵՐԻ ԿԱՐԳԱՎԻՃԱԿԸ",
    onTheWay: "Ճանապարհին",
    door: "Ամեն գիրք դուռ է բացում դեպի մեկ այլ աշխարհ",
    thanks: "Շնորհակալություն, որ ընտրեցիք MystBook-ը։ Ուրախ ենք լինել Ձեր ընթերցանության ճանապարհորդության մասնակիցը։",
    withLove: "Սիրով՝",
    team: "Ձեր MystBook թիմը",
    contact: "Կապ հաստատելու համար զանգահարեք։",
    footer: "Մի քիչ առեղծված։ Շատ պատմություններ։",
  },
} as const;

/** The number customers are asked to call, shown (italic, as a tap-to-call link) at the end of their email. */
const CONTACT_PHONE = "(+374) 77 731713";
const CONTACT_PHONE_HREF = "tel:+37477731713";

/**
 * The customer's "your order is on its way" email, in the language they are using the site in. "Keep it a mystery"
 * never reveals the book: its subject has no title and its card shows a sealed-book block instead of the cover,
 * title and author.
 */
export function buildCustomerOrderEmail(input: CustomerOrderEmailInput, locale: Locale): Pick<EmailMessage, "subject" | "text" | "html"> {
  const c = COPY[locale];
  const revealed = input.revealMode === "show_now";
  const subject = revealed ? `${c.subject} | ${input.book.title}` : c.subject;
  const location = [input.address.city, input.address.region, input.address.country].map((p) => p?.trim()).filter(Boolean).join(", ");
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const price = orderTotal();
  const title = revealed ? input.book.title : c.mysteryTitle;
  const sub = revealed ? c.by(input.book.author) : c.mysterySub;

  const text = [
    c.greeting(input.firstName),
    "",
    c.intro,
    "",
    `${c.selectedBook}: ${title}`,
    sub,
    price,
    "",
    `${c.orderedBy}: ${fullName}`,
    `${c.orderLocation}: ${location}`,
    `${c.orderStatus}: ${c.onTheWay}`,
    "",
    c.door,
    c.thanks,
    "",
    c.withLove,
    c.team,
    "",
    c.contact,
    CONTACT_PHONE,
  ].join("\n");

  const summary = `
            <div style="font-size:13px;letter-spacing:1px;color:${C.muted};">${esc(c.selectedBook)}</div>
            <div style="font-size:24px;line-height:1.25;color:${C.ink};padding-top:8px;">${esc(title)}</div>
            <div style="font-size:17px;color:${C.muted};padding-top:6px;">${esc(sub)}</div>
            <div style="font-size:26px;font-weight:600;color:${C.ink};padding-top:10px;">${esc(price)}</div>`;
  const rows = `${detailRow(c.orderedBy, fullName, "&#128100;")}${detailRow(c.orderLocation, location, "&#128205;")}${detailRow(c.orderStatus, c.onTheWay, "&#10004;")}`;

  const middle = `
    <tr><td style="padding:30px 30px 8px 30px;font-family:${SANS};">
      <div style="font-size:14px;letter-spacing:1px;color:${C.muted};">${esc(c.eyebrow)}</div>
      <div style="font-size:24px;color:${C.ink};padding-top:18px;">${esc(c.greeting(input.firstName))}</div>
      <div style="font-size:17px;line-height:1.65;color:#1f1f1f;padding-top:14px;">${esc(c.intro)}</div>
      <div style="border-top:1px solid ${C.rule};margin-top:22px;"></div>
    </td></tr>${orderCard(coverBlock(revealed ? input.book.coverUrl : null), summary, rows)}
    <tr><td align="center" style="padding:22px 30px 26px 30px;">
      <div style="font-family:${SANS};font-size:17px;color:${C.ink};">${esc(c.door)}</div>
      <div style="font-family:${SANS};font-size:16px;line-height:1.6;color:${C.muted};padding-top:16px;">${esc(c.thanks)}</div>
      <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:${C.ink};padding-top:22px;">${esc(c.withLove)}</div>
      <div style="font-family:${SANS};font-size:22px;color:${C.ink};padding-top:6px;">${esc(c.team)}</div>
      <div style="font-family:${SANS};font-size:16px;font-style:italic;color:${C.muted};padding-top:26px;">${esc(c.contact)}</div>
      <div style="font-family:${SANS};font-size:17px;font-style:italic;padding-top:4px;"><a href="${CONTACT_PHONE_HREF}" style="color:${C.ink};text-decoration:none;font-style:italic;">${esc(CONTACT_PHONE)}</a></div>
    </td></tr>`;

  return { subject, text, html: emailShell({ lang: locale, title: subject, tagline: c.tagline, footer: c.footer, middle }) };
}

/** Sends the customer their order email. A delivery problem is logged (by `sendEmail`) and never fails the order. */
export async function sendCustomerOrderEmail(input: CustomerOrderEmailInput, locale: Locale): Promise<void> {
  await sendEmail({ to: input.to, ...buildCustomerOrderEmail(input, locale) });
}
