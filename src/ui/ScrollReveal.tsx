"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BOOK_INTRO_DONE_EVENT, isBookIntroActive } from "@/lib/book-intro";

/**
 * Reveals its children once the group actually scrolls into view, instead of all at once on mount — the hub
 * page's own book unfolds as you scroll through it, section by section, rather than firing the moment the page
 * loads. Children opt in with the `reveal-item`/`chapter-row` classes and their own `--i` (their position within
 * this group, set inline) for a staggered entrance — see `globals.css`'s own rules, gated on this wrapper's
 * `data-revealed` rather than firing at mount. Fires once per group and never re-hides; `prefers-reduced-motion`
 * is handled globally (see the reduced-motion block in `globals.css`), so nothing extra is needed here.
 */
export function ScrollReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    let cancelled = false;
    // The hub's closed-book cover sits on top of the page for a few seconds; reveals that fire behind it would be
    // finished before anyone sees them, so hold until it has gone.
    const tryReveal = () => {
      if (cancelled || !inView || isBookIntroActive()) return;
      setRevealed(true);
      observer.disconnect();
      window.removeEventListener(BOOK_INTRO_DONE_EVENT, tryReveal);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          inView = true;
          tryReveal();
        }
      },
      // threshold 0 (any overlap), not a visible-fraction: a long list can be taller than the window, so a
      // fraction of it may never fit on screen and the group would stay hidden forever.
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    window.addEventListener(BOOK_INTRO_DONE_EVENT, tryReveal);
    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener(BOOK_INTRO_DONE_EVENT, tryReveal);
    };
  }, []);

  return (
    <div ref={ref} className={className} data-revealed={revealed || undefined}>
      {children}
    </div>
  );
}
