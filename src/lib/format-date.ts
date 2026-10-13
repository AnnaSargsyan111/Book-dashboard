/** A calm, locale-aware "January 3, 2026" — used anywhere a saved date is shown to a reader rather than a
 *  machine (Thoughts' creation/update dates today). */
export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}
