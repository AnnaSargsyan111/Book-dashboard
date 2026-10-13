"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/ui/Button";

/** Last-resort boundary: friendly, localized, no technical detail. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <p className="mb-6 text-lg text-ink-2">{t("errors.server")}</p>
        <Button onClick={reset}>{t("common.retry")}</Button>
      </div>
    </main>
  );
}
