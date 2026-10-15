"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/ui/Button";

/**
 * Mystery Book's own premium hero — the page's "room" within the shared design system, the one place in the app
 * that uses a real photograph rather than a hand-drawn motif (Section 1: "real bookshelves... not an AI-generated
 * fantasy scene"). Replaces the flow's own plain entry screen one-for-one (see `MysteryBookFlow`'s
 * `landingContent` prop) — same transition into Step 1, just dressed for the room it's actually in. The photo
 * itself (`public/images/mystery-hero.jpg`) is a cozy library interior, chosen with the project owner from a
 * short-list of real, freely-licensed photographs (Unsplash) rather than generated or illustrated.
 */
export function MysteryHero({ onStart }: { onStart: () => void }) {
  const t = useTranslations("mysteryBook");

  return (
    <div
      id="mystery-hero"
      className="mystery-hero animate-rise relative mx-auto flex min-h-[26rem] max-w-2xl flex-col justify-end overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] sm:min-h-[30rem]"
    >
      <Image
        src="/images/mystery-hero.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 42rem) 42rem, 100vw"
        className="object-cover"
      />
      <div className="mystery-hero-overlay" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-start gap-5 p-6 sm:p-10">
        <h1 className="max-w-[16ch] text-balance font-display text-[clamp(2rem,1.6rem+2vw,3rem)] leading-[1.08] tracking-[-0.01em] text-white">
          {t("entry.title")}
        </h1>
        <p className="max-w-[38ch] text-[1.0625rem] leading-relaxed text-white/85">{t("landing.subtitle")}</p>
        <Button
          id="mystery-hero-cta"
          onClick={onStart}
          className="shadow-[0_18px_34px_-16px_rgb(0_0_0/0.6)]"
          style={{ background: "var(--scene-candle)", color: "var(--scene-espresso)" }}
        >
          {t("entry.cta")}
        </Button>
      </div>
    </div>
  );
}
