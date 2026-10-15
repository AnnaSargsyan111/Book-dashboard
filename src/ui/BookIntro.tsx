"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BOOK_INTRO_SEEN_KEY as SEEN_KEY, clearBookIntroCookie, setBookIntroActive, willBookIntroPlay } from "@/lib/book-intro";
import { BookIntroCover } from "./BookIntroCover";
import { lockBodyScroll } from "@/lib/scroll-lock";

const HOLD_MS = 4000;
const OPEN_MS = 1150;
const FADE_MS = 650;

type Phase = "closed" | "opening" | "revealing";

/**
 * The hub page's one-time entrance: a closed book carrying the same real welcome text as the open book's own
 * cover below it, held for a beat, then opened with a real 3D page-turn into the actual page underneath — which
 * is already rendered, unchanged, the entire time; this is a fixed overlay on top of it, never a gate on the
 * real content or a separate route. Shown once per login and once after onboarding (`localStorage` flag, re-armed by
 * `LoginForm`, `RegisterForm` and `OnboardingForm`), skipped entirely under
 * `prefers-reduced-motion` (nothing was ever hidden, so skipping is just rendering nothing), and safe to fail:
 * if this component's effects never run, the page beneath was never covered up in the first place. A click
 * during the hold skips straight to opening, for anyone who'd rather not wait.
 */
export function BookIntro({ eyebrow, title, intro, initiallyVisible = false }: { eyebrow: string; title: ReactNode; intro: string; initiallyVisible?: boolean }) {
  // `initiallyVisible` comes from the server reading the "intro pending" cookie: the closed book is part of the
  // very first HTML, so the page beneath is never seen for even a frame before the cover goes on.
  const [visible, setVisible] = useState(initiallyVisible);
  const [phase, setPhase] = useState<Phase>("closed");

  // Decided synchronously on mount (not via a hook that resolves a tick later) so the hub's own reveals, which
  // start observing in this same commit, already know to wait for the cover.
  useEffect(() => {
    if (!willBookIntroPlay()) {
      // Reduced motion (the one case the server can't see): take back a cover that was drawn in advance.
      if (initiallyVisible) {
        setVisible(false);
        clearBookIntroCookie();
      }
      return;
    }
    setBookIntroActive(true);
    setVisible(true);
    return () => setBookIntroActive(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "revealing") setBookIntroActive(false);
  }, [phase]);

  useEffect(() => {
    if (!visible) return;
    const unlockScroll = lockBodyScroll();
    return () => {
      unlockScroll();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || phase !== "closed") return;
    const timer = setTimeout(() => setPhase("opening"), HOLD_MS);
    return () => clearTimeout(timer);
  }, [visible, phase]);

  useEffect(() => {
    if (phase !== "opening") return;
    const timer = setTimeout(() => setPhase("revealing"), OPEN_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "revealing") return;
    clearBookIntroCookie();
    try {
      localStorage.setItem(SEEN_KEY, "true");
    } catch {
      // Best-effort only: if this fails, the worst case is the intro plays again next visit.
    }
    const timer = setTimeout(() => setVisible(false), FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  if (!visible) return null;

  const open = phase !== "closed";

  return (
    <div
      aria-hidden="true"
      className="book-intro-backdrop fixed inset-0 z-[100] flex items-center justify-center p-5"
      data-revealing={phase === "revealing" || undefined}
      onClick={() => phase === "closed" && setPhase("opening")}
    >
      <BookIntroCover eyebrow={eyebrow} title={title} intro={intro} open={open} />
    </div>
  );
}
