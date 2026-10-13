import { createTranslator } from "next-intl";
import { LOCALE_COOKIE, toLocale, type Locale } from "@/i18n/config";
import { catalogs } from "@/i18n/messages";
import { VALIDATION_PARAMS } from "@/shared/validation/keys";

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

/** Server-side translator for API messages and emails. Uses the same catalogs as the UI. */
export function getTranslator(locale: Locale): TranslateFn {
  const t = createTranslator({ locale, messages: catalogs[locale] }) as unknown as TranslateFn;
  return (key, values) => t(key, { ...VALIDATION_PARAMS, ...values });
}

/** Language of a request, from the persisted cookie; English when absent or unknown. */
export function localeFromCookieHeader(cookieHeader: string | null): Locale {
  const match = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
  return toLocale(match?.[1] ? decodeURIComponent(match[1]) : undefined);
}
