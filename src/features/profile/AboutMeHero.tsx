import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * The editorial hero at the top of About Me: a real photograph (a window-side reading corner — books, a vase,
 * a cup of coffee) rather than the flat illustrated band this used to be, following the exact technique Mystery
 * Book's hero established first (`MysteryHero`): `next/image fill priority` plus a warm gradient-and-grain scrim
 * (`.photo-hero-overlay`) so the title stays legible wherever it falls. Same props, same text, same bleed — only
 * the art direction changed. Bleeds to the edges of the content column via negative margins sized to cancel
 * AppFrame's own padding.
 */
export function AboutMeHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      className="hero-band -mx-5 -mt-12 flex min-h-[16rem] flex-col justify-center px-5 py-10 sm:-mx-8 sm:-mt-20 sm:min-h-[20rem] sm:px-8 sm:py-14"
      style={{ ["--glow-x" as string]: "86%", ["--glow-y" as string]: "28%" } as CSSProperties}
    >
      <Image src="/images/about-me-hero.jpg" alt="" fill priority sizes="(min-width: 64rem) 56rem, 100vw" className="object-cover" style={{ objectPosition: "72% 65%" }} />
      <div className="photo-hero-overlay" aria-hidden="true" />
      <div className="relative max-w-[65%]">
        <h1 className="max-w-[18ch] text-balance font-display text-[clamp(2rem,1.5rem+2.2vw,3rem)] leading-[1.08] tracking-[-0.01em] text-cloth-ink">{title}</h1>
        <p className="mt-3 max-w-[40ch] text-[1.0625rem] leading-relaxed text-cloth-ink/70">{subtitle}</p>
      </div>
    </div>
  );
}
