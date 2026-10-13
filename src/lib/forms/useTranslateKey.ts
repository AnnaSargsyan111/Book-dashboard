"use client";

import { useTranslations } from "next-intl";
import { VALIDATION_PARAMS } from "@/shared/validation/keys";

/**
 * Turns a translation key ("validation.latinOnly", "errors.network") into text in the language active right now.
 * Returns undefined for no key, so it can be passed straight to a field's `error` prop.
 */
export function useTranslateKey() {
  const t = useTranslations() as unknown as (key: string, values?: Record<string, number>) => string;
  return (key?: string | null) => (key ? t(key, VALIDATION_PARAMS) : undefined);
}
