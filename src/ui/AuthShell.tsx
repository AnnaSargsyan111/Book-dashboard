import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { AuthColumn } from "./AuthColumn";
import { MarginPanel } from "./MarginPanel";

/**
 * Shared frame for every authentication screen: the brand panel on desktop, a compact header on mobile, and a
 * single centred column for the form. New auth screens only supply their content.
 */
export async function AuthShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const t = await getTranslations("common");

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-paper focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        {t("skipToContent")}
      </a>
      <MarginPanel />
      <AuthColumn wide={wide}>{children}</AuthColumn>
    </div>
  );
}
