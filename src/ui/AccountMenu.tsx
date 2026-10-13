"use client";

import { SignOutButton } from "@/features/auth/SignOutButton";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

/**
 * The header's initials avatar (an ex-libris-style monogram, not a photo placeholder) and its one-item dropdown.
 * Closes on an outside click, Escape, or choosing the item.
 */
export function AccountMenu({ firstName, lastName }: { firstName: string; lastName: string }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("account")}
        className="seal grid size-9 place-items-center rounded-full border border-rule-strong font-display text-[0.8125rem] font-medium tracking-wide text-ink transition-colors hover:border-ink lg:size-8"
      >
        {initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t("account")}
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -2 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+0.625rem)] z-30 min-w-[9.5rem] rounded-xl border border-rule-strong bg-surface p-1.5 shadow-[0_20px_45px_-20px_rgb(0_0_0/0.35)]"
          >
            <SignOutButton menuItem onAfterClick={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
