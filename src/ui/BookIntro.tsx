"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BOOK_INTRO_SEEN_KEY as SEEN_KEY, setBookIntroActive, willBookIntroPlay } from "@/lib/book-intro";

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
export function BookIntro({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro: string }) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("closed");

  // Decided synchronously on mount (not via a hook that resolves a tick later) so the hub's own reveals, which
  // start observing in this same commit, already know to wait for the cover.
  useEffect(() => {
    if (!willBookIntroPlay()) return;
    setBookIntroActive(true);
    setVisible(true);
    return () => setBookIntroActive(false);
  }, []);

  useEffect(() => {
    if (phase === "revealing") setBookIntroActive(false);
  }, [phase]);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
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
      <div className="book-intro-glow" data-open={open || undefined} />
      <div className="book-intro-stage relative aspect-[3/4] w-[min(22rem,86vw)]">
        <div className="book-intro-pages" />
        <div className="book-intro-cover cloth relative flex flex-col items-center justify-center px-7 py-10 text-center sm:px-10" data-open={open || undefined}>
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-cloth-ink/60">{eyebrow}</p>
          <h1 className="mt-3 max-w-[16ch] text-balance font-display text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.12] tracking-[-0.01em] text-cloth-ink">{title}</h1>
          <p className="mt-4 max-w-[26ch] text-[0.9375rem] leading-relaxed text-cloth-ink/70">{intro}</p>
        </div>
      </div>
    </div>
  );
}
