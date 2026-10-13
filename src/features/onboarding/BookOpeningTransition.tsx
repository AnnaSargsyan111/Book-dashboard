"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { LogoMark } from "@/ui/Logo";

/**
 * The short beat between finishing "Tell us about yourself" and arriving at the app's hub page: a closed cover
 * swings open on the library-cloth backdrop, then the whole scene fades so the hub page underneath can take over.
 * `onDone` fires once, when it is safe to navigate. With reduced motion the motion is skipped for an equally
 * short, still pause instead (no CSS animation to end, so a timer stands in for it).
 */
export function BookOpeningTransition({ onDone }: { onDone: () => void }) {
  const t = useTranslations("onboarding");
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!reduced) return;
    const id = setTimeout(onDone, 550);
    return () => clearTimeout(id);
  }, [reduced, onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center gap-7 cloth text-cloth-ink ${reduced ? "" : "entrance-overlay"}`}
      onAnimationEnd={(e) => {
        if (!reduced && e.target === e.currentTarget) onDone();
      }}
    >
      {reduced ? (
        <LogoMark size={30} />
      ) : (
        <div className="entrance-scene" aria-hidden="true">
          <div className="entrance-base">
            <span className="entrance-base-line" />
            <span className="entrance-base-line" />
            <span className="entrance-base-line" />
          </div>
          <div className="entrance-cover">
            <LogoMark size={28} />
          </div>
        </div>
      )}
      <p className="text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-cloth-ink/65">{t("opening")}</p>
    </div>
  );
}
