import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/**
 * The hub page's own hero: taller than the five sections' own hero bands (this is the app's one arrival moment,
 * not a room among others), same `.hero-band` / `.photo-hero-overlay` bleed-to-the-edges recipe they all share.
 *
 * The photo itself (`public/images/home-hero.jpg`) is a close-up of an open book's own spine and gutter in soft,
 * neutral light — Diane Alkier, "a close-up of an open book on a table", free to use under the Unsplash License
 * (https://unsplash.com/photos/t4WX4s6_AU4) — chosen deliberately over a more literal "library" or "desk" shot:
 * it's the one photograph in the app that shows a real two-page spread, which is what the chapter list below
 * echoes in layout. The generous negative space in its lower half is also what keeps the title legible without
 * fighting the image the way a busier photo would.
 */
export function HomeHero({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro: string }) {
  return (
    <div
      className="hero-band -mx-5 -mt-12 flex min-h-[20rem] flex-col justify-center px-5 py-10 sm:-mx-8 sm:-mt-20 sm:min-h-[26rem] sm:px-8 sm:py-14 lg:min-h-[30rem]"
      style={{ ["--glow-x" as string]: "22%", ["--glow-y" as string]: "4%" } as CSSProperties}
    >
      <Image src="/images/home-hero.jpg" alt="" fill priority sizes="(min-width: 64rem) 56rem, 100vw" className="object-cover" style={{ objectPosition: "50% 38%" }} />
      <div className="photo-hero-overlay" aria-hidden="true" />
      <div className="relative max-w-[32rem]">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-cloth-ink/65">{eyebrow}</p>
        <h1 className="mt-2 max-w-[20ch] text-balance font-display text-[clamp(2.1rem,1.5rem+2.6vw,3.5rem)] leading-[1.06] tracking-[-0.01em] text-cloth-ink">{title}</h1>
        <p className="mt-4 max-w-[42ch] text-[1.0625rem] leading-relaxed text-cloth-ink/70">{intro}</p>
      </div>
    </div>
  );
}
