"use client";

import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { setLocaleAction } from "@/i18n/actions";
import { localeMeta, locales, type Locale } from "@/i18n/config";

/**
 * Segmented English / Armenian control. Choosing a language saves it in a cookie (so it persists across visits)
 * and re-renders the current route in place, which keeps anything already typed into a form.
 */
export function LanguageSwitcher() {
  const current = useLocale() as Locale;
  const t = useTranslations("language");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // The content dims for a beat while the new language renders (styles in globals.css).
  useEffect(() => {
    document.documentElement.dataset.langPending = pending ? "true" : "false";
  }, [pending]);

  function choose(next: Locale) {
    if (next === current || pending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div role="group" aria-label={t("label")} className="relative inline-flex rounded-full border border-rule-strong bg-surface/70 p-0.5">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            onClick={() => choose(locale)}
            aria-pressed={active}
            aria-label={localeMeta[locale].native}
            title={active ? undefined : t("switchTo", { language: localeMeta[locale].native })}
            // font-family is re-evaluated on the button so its own lang (hy) picks the Armenian stack even on an English page
            className={`relative min-h-8 min-w-10 rounded-full px-2.5 py-1 text-xs sm:min-h-7 sm:min-w-9 font-semibold tracking-wide transition-colors duration-200 [font-family:var(--f-ui)] ${
              active ? "text-paper" : "text-ink-2 hover:text-ink"
            }`}
          >
            {active ? (
              <motion.span layoutId="language-pill" transition={{ type: "spring", stiffness: 520, damping: 40 }} className="absolute inset-0 rounded-full bg-ink" />
            ) : null}
            <span className="relative">{localeMeta[locale].short}</span>
          </button>
        );
      })}
    </div>
  );
}
