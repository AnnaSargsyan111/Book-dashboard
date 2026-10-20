"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { NAV_ITEMS } from "./nav-items";
import { lockBodyScroll } from "@/lib/scroll-lock";

/**
 * Mobile's stand-in for the desktop sidebar: not a shrunk copy of it, but a full-screen menu on the same dark
 * library-cloth material, styled like a book's table of contents (numbered entries, a large serif title each).
 * Opens from a plain icon button in the header.
 */
export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A tap on any entry navigates; close automatically rather than making the user dismiss it separately.
  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const unlockScroll = lockBodyScroll();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("openMenu")}
        className="grid size-10 place-items-center rounded-full border border-rule-strong text-ink transition-colors hover:border-ink lg:hidden"
      >
        <span className="menu-glyph" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t("label")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="cloth fixed inset-0 z-40 flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-cloth-ink/60">{t("tableOfContents")}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("closeMenu")}
                className="grid size-10 place-items-center rounded-full text-cloth-ink transition-colors hover:bg-white/10"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label={t("label")} className="flex flex-1 flex-col justify-center px-5 sm:px-8">
              <ol className="toc toc-dark">
                {NAV_ITEMS.map((item, i) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href} className="toc-row" style={{ ["--i" as string]: i } as CSSProperties}>
                      <Link href={item.href} prefetch aria-current={active ? "page" : undefined} data-active={active || undefined} className="toc-link">
                        <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                        <span className="toc-title">{t(item.key)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="flex items-center justify-center px-5 pb-8 sm:px-8">
              <LanguageSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
