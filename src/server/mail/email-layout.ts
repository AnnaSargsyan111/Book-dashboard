import { DELIVERY_FEE_AMD, MYSTERY_BOOK_PRICE_AMD } from "@/shared/validation/mystery";

/** Pieces shared by MystBook's HTML emails (the customer's confirmation and the owner's order notice): the same
 *  deep-green header with the typographic logo, cream paper, white order card and footer band. Tables and inline
 *  styles only — that is what mail clients render reliably. */

export const C = { green: "#263f33", cream: "#f7f2ea", gold: "#e8d4a0", ink: "#26352c", muted: "#6f6f62", rule: "#dcd3bf", band: "#ece4d6", card: "#ffffff" };
export const SERIF = "Georgia, 'Times New Roman', serif";
export const SANS = "'Segoe UI', Calibri, Helvetica, Arial, sans-serif";

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Same format as the payment step: "9,400 ֏". */
export const formatAmd = (amount: number) => `${amount.toLocaleString("en-US")} ֏`;
export const orderTotal = () => formatAmd(MYSTERY_BOOK_PRICE_AMD + DELIVERY_FEE_AMD);

/** The book picture: its cover when there is one, otherwise a sealed-book block with a "?". */
export function coverBlock(coverUrl: string | null): string {
  return coverUrl
    ? `<img src="${esc(coverUrl)}" width="112" alt="" style="display:block;width:112px;height:auto;border-radius:10px;border:0;">`
    : `<table role="presentation" cellpadding="0" cellspacing="0" width="112" style="width:112px;"><tr><td align="center" height="164" style="height:164px;background:${C.green};border-radius:10px;border:2px solid ${C.gold};font-family:${SERIF};font-size:54px;font-style:italic;color:${C.gold};">?</td></tr></table>`;
}

/** One labelled row of the order card ("ORDERED BY / Anna Sargsyan"). */
export function detailRow(label: string, value: string, glyph: string): string {
  return `
        <tr><td style="padding:14px 0 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td valign="top" style="width:30px;font-size:17px;line-height:20px;color:${C.muted};">${glyph}</td>
            <td style="font-family:${SANS};">
              <div style="font-size:12px;letter-spacing:1px;color:${C.muted};text-transform:uppercase;">${esc(label)}</div>
              <div style="font-size:17px;font-weight:600;color:${C.ink};padding-top:3px;">${esc(value)}</div>
            </td>
          </tr></table>
        </td></tr>`;
}

/** The order card: cover on the left, `summary` (label, title, author, price) beside it, `rows` underneath. */
export function orderCard(cover: string, summary: string, rows: string): string {
  return `
    <tr><td style="padding:14px 30px 8px 30px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${C.card};border:1px solid ${C.rule};border-radius:16px;"><tr><td style="padding:20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
          <td valign="top" width="124" style="width:124px;">${cover}</td>
          <td valign="top" style="padding-left:6px;font-family:${SANS};">${summary}</td>
        </tr></table>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:18px;border-top:1px solid ${C.rule};">${rows}
        </table>
      </td></tr></table>
    </td></tr>`;
}

/** The whole page: header (logo, name, tagline), `middle` (everything between header and footer band), footer band. */
export function emailShell(opts: { lang: string; title: string; tagline: string; footer: string; middle: string }): string {
  return `<!doctype html>
<html lang="${opts.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;"><tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:100%;max-width:600px;background:${C.cream};border:1px solid ${C.rule};border-radius:16px;overflow:hidden;">
    <tr><td align="center" style="background:${C.green};padding:34px 24px 30px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td align="center" width="76" height="76" style="width:76px;height:76px;background:#0f4a47;border:1px solid ${C.gold};border-radius:18px;font-family:${SERIF};font-size:44px;font-style:italic;color:${C.gold};">M</td></tr></table>
      <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:${C.gold};padding-top:14px;">MystBook</div>
      <div style="font-family:${SANS};font-size:12px;letter-spacing:1.5px;color:#f1ead8;padding-top:8px;">${esc(opts.tagline)}</div>
    </td></tr>${opts.middle}
    <tr><td align="center" style="background:${C.band};padding:18px 24px;font-family:${SANS};">
      <div style="font-size:14px;color:${C.muted};">${esc(opts.footer)}</div>
      <div style="font-size:14px;color:${C.muted};padding-top:8px;">&copy; MystBook</div>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}
