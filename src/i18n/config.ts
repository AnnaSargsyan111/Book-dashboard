export const locales = ["en", "hy"] as const;
export type Locale = (typeof locales)[number];

/** English is the default on first visit (no browser-language sniffing, by product decision). */
export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** Native names: shown the same way in every language so a lost user can always find theirs. */
export const localeMeta: Record<Locale, { native: string; short: string }> = {
  en: { native: "English", short: "EN" },
  hy: { native: "Հայերեն", short: "ՀԱՅ" },
};
