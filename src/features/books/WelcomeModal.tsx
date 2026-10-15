"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BOOK_INTRO_DONE_EVENT, isBookIntroActive, willBookIntroPlay } from "@/lib/book-intro";
import { ROUTES } from "@/shared/routes";
import { Button } from "@/ui/Button";
import { LogoMark } from "@/ui/Logo";
import { richMark } from "@/ui/rich";
import { booksApi } from "./api";

const CLOSE_MS = 240;

/**
 * The one-time entrance into the user's library: shown once, right after "Tell us about yourself" (and never
 * again — `welcomeModalSeen` is only ever read once, server-side, by the page that renders this). Dismissing it
 * (the X, Escape, a click on the backdrop, or the CTA) marks it seen in the database, not just in this browser.
 */
export function WelcomeModal() {
  const t = useTranslations("books.welcomeModal");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [closing, setClosing] = useState(false);
  // The modal opens only after the hub's closed-book entrance has finished (or straight away when that isn't
  // playing): the book opens first, then the welcome appears on the page it opened onto.
  const [ready, setReady] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const seenRef = useRef(false);

  useEffect(() => {
    if (!willBookIntroPlay()) {
      setReady(true);
      return;
    }
    // Re-checked on the next tick: a dev-mode remount of the intro fires "done" for an instant before re-arming.
    const onDone = () => window.setTimeout(() => !isBookIntroActive() && setReady(true), 0);
    window.addEventListener(BOOK_INTRO_DONE_EVENT, onDone);
    return () => window.removeEventListener(BOOK_INTRO_DONE_EVENT, onDone);
  }, []);

  useEffect(() => {
    if (!open || !ready) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ready]);

  function markSeen() {
    if (seenRef.current) return;
    seenRef.current = true;
    // Best-effort: the modal has already closed in the UI. If this fails, the worst case is it shows once more.
    booksApi.markWelcomeSeen().catch(() => {});
  }

  /** Fades the modal and its page blur out (see `.welcome-backdrop[data-closing]`) before unmounting, so the page
   *  eases back to normal instead of snapping. The timer, not `animationend`, ends it: it must also fire when
   *  motion is reduced and nothing animates. */
  function dismiss() {
    markSeen();
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => setOpen(false), CLOSE_MS);
  }

  function addFirstBook() {
    markSeen();
    router.push(ROUTES.addBook);
  }

  if (!open || !ready) return null;

  return (
    <div
      role="presentation"
      data-closing={closing || undefined}
      className="welcome-backdrop fixed inset-0 z-[80] flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        tabIndex={-1}
        className="welcome-panel relative grid w-full max-w-[38rem] grid-cols-[3.25rem_1fr] overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_50px_100px_-30px_rgb(0_0_0/0.55)] outline-none sm:grid-cols-[3.75rem_1fr]"
      >
        <div className="welcome-spine cloth relative" aria-hidden="true">
          <span className="welcome-ribbon" />
        </div>

        <div className="relative px-7 py-10 sm:px-11 sm:py-12">
          <button
            type="button"
            onClick={dismiss}
            aria-label={tc("close")}
            className="absolute right-5 top-5 grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="size-[1.125rem]" aria-hidden="true" />
          </button>

          <span className="mb-5 inline-grid size-11 place-items-center rounded-full bg-marker text-[color:var(--marker-ink)]">
            <LogoMark size={20} />
          </span>

          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted">{t("eyebrow")}</p>
          <h2
            id="welcome-modal-title"
            className="max-w-[20ch] text-balance font-display text-[clamp(1.75rem,1.35rem+1.6vw,2.5rem)] leading-[1.1] tracking-[-0.01em]"
          >
            {t.rich("title", richMark)}
          </h2>

          <Button onClick={addFirstBook} className="mt-8">
            {t("cta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
