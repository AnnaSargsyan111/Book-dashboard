import { DELIVERY_FEE_AMD, MYSTERY_BOOK_PRICE_AMD, type RevealMode } from "@/shared/validation/mystery";
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
    footer: "Մի քիչ առեղծված։ Շատ պատմություններ։",
  },
} as const;

const formatAmd = (amount: number) => `${amount.toLocaleString("en-US")} ֏`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// The palette of the email, taken from the design: deep library green, cream paper, gold lettering.
const C = { green: "#263f33", cream: "#f7f2ea", gold: "#e8d4a0", ink: "#26352c", muted: "#6f6f62", rule: "#dcd3bf", band: "#ece4d6", card: "#ffffff" };
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Calibri, Helvetica, Arial, sans-serif";

/**
 * The customer's "your order is on its way" email, in the language they are using the site in. Built from tables
 * and inline styles only, since that is what mail clients render reliably. "Keep it a mystery" never reveals the book:
 * its subject has no title and its card shows a sealed-book block instead of the cover, title and author.
 */
export function buildCustomerOrderEmail(input: CustomerOrderEmailInput, locale: Locale): Pick<EmailMessage, "subject" | "text" | "html"> {
  const c = COPY[locale];
  const revealed = input.revealMode === "show_now";
  const subject = revealed ? `${c.subject} | ${input.book.title}` : c.subject;
  const location = [input.address.city, input.address.region, input.address.country].map((p) => p?.trim()).filter(Boolean).join(", ");
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const price = formatAmd(MYSTERY_BOOK_PRICE_AMD + DELIVERY_FEE_AMD);
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
  ].join("\n");

  const cover =
    revealed && input.book.coverUrl
      ? `<img src="${esc(input.book.coverUrl)}" width="112" alt="" style="display:block;width:112px;height:auto;border-radius:10px;border:0;">`
      : `<table role="presentation" cellpadding="0" cellspacing="0" width="112" style="width:112px;"><tr><td align="center" height="164" style="height:164px;background:${C.green};border-radius:10px;border:2px solid ${C.gold};font-family:${SERIF};font-size:54px;font-style:italic;color:${C.gold};">?</td></tr></table>`;

  const detail = (label: string, value: string, glyph: string) => `
        <tr><td style="padding:14px 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td valign="top" style="width:30px;font-size:17px;line-height:20px;color:${C.muted};">${glyph}</td>
            <td style="font-family:${SANS};">
              <div style="font-size:12px;letter-spacing:1px;color:${C.muted};text-transform:uppercase;">${esc(label)}</div>
              <div style="font-size:17px;font-weight:600;color:${C.ink};padding-top:3px;">${esc(value)}</div>
            </td>
          </tr></table>
        </td></tr>`;

  const html = `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;"><tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:100%;max-width:600px;background:${C.cream};border:1px solid ${C.rule};border-radius:16px;overflow:hidden;">
    <tr><td align="center" style="background:${C.green};padding:34px 24px 30px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td align="center" width="76" height="76" style="width:76px;height:76px;background:#0f4a47;border:1px solid ${C.gold};border-radius:18px;font-family:${SERIF};font-size:44px;font-style:italic;color:${C.gold};">M</td></tr></table>
      <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:${C.gold};padding-top:14px;">MystBook</div>
      <div style="font-family:${SANS};font-size:12px;letter-spacing:1.5px;color:#f1ead8;padding-top:8px;">${esc(c.tagline)}</div>
    </td></tr>
    <tr><td style="padding:30px 30px 8px 30px;font-family:${SANS};">
      <div style="font-size:14px;letter-spacing:1px;color:${C.muted};">${esc(c.eyebrow)}</div>
      <div style="font-size:24px;color:${C.ink};padding-top:18px;">${esc(c.greeting(input.firstName))}</div>
      <div style="font-size:17px;line-height:1.65;color:#1f1f1f;padding-top:14px;">${esc(c.intro)}</div>
      <div style="border-top:1px solid ${C.rule};margin-top:22px;"></div>
    </td></tr>
    <tr><td style="padding:14px 30px 8px 30px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${C.card};border:1px solid ${C.rule};border-radius:16px;"><tr><td style="padding:20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
          <td valign="top" width="124" style="width:124px;">${cover}</td>
          <td valign="top" style="padding-left:6px;font-family:${SANS};">
            <div style="font-size:13px;letter-spacing:1px;color:${C.muted};">${esc(c.selectedBook)}</div>
            <div style="font-size:24px;line-height:1.25;color:${C.ink};padding-top:8px;">${esc(title)}</div>
            <div style="font-size:17px;color:${C.muted};padding-top:6px;">${esc(sub)}</div>
            <div style="font-size:26px;font-weight:600;color:${C.ink};padding-top:10px;">${esc(price)}</div>
          </td>
        </tr></table>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:18px;border-top:1px solid ${C.rule};">${detail(c.orderedBy, fullName, "&#128100;")}${detail(c.orderLocation, location, "&#128205;")}${detail(c.orderStatus, c.onTheWay, "&#10004;")}
        </table>
      </td></tr></table>
    </td></tr>
    <tr><td align="center" style="padding:22px 30px 26px 30px;">
      <div style="font-family:${SANS};font-size:17px;color:${C.ink};">${esc(c.door)}</div>
      <div style="font-family:${SANS};font-size:16px;line-height:1.6;color:${C.muted};padding-top:16px;">${esc(c.thanks)}</div>
      <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:${C.ink};padding-top:22px;">${esc(c.withLove)}</div>
      <div style="font-family:${SANS};font-size:22px;color:${C.ink};padding-top:6px;">${esc(c.team)}</div>
    </td></tr>
    <tr><td align="center" style="background:${C.band};padding:18px 24px;font-family:${SANS};">
      <div style="font-size:14px;color:${C.muted};">${esc(c.footer)}</div>
      <div style="font-size:14px;color:${C.muted};padding-top:8px;">&copy; MystBook</div>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  return { subject, text, html };
}

/** Sends the customer their order email. A delivery problem is logged (by `sendEmail`) and never fails the order. */
export async function sendCustomerOrderEmail(input: CustomerOrderEmailInput, locale: Locale): Promise<void> {
  await sendEmail({ to: input.to, ...buildCustomerOrderEmail(input, locale) });
}
