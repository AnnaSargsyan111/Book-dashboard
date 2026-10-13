import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * Thoughts' own editorial hero: a real photograph (a lamplit writing desk — a typewriter, a candle) carrying
 * forward the quiet-writing-desk mood `PageScene`'s old `PenLine` motif used to gesture at, following the same
 * technique as About Me, Books and Mystery Book. Shown above both the populated collection and the empty state.
 */
export function ThoughtsHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      className="hero-band -mx-5 -mt-12 flex min-h-[16rem] flex-col justify-center px-5 py-10 sm:-mx-8 sm:-mt-20 sm:min-h-[20rem] sm:px-8 sm:py-14"
      style={{ ["--glow-x" as string]: "78%", ["--glow-y" as string]: "70%" } as CSSProperties}
    >
      <Image src="/images/thoughts-hero.jpg" alt="" fill priority sizes="(min-width: 64rem) 56rem, 100vw" className="object-cover" style={{ objectPosition: "60% 58%" }} />
      <div className="photo-hero-overlay" aria-hidden="true" />
      <div className="relative max-w-[65%]">
        <h1 className="max-w-[18ch] text-balance font-display text-[clamp(2rem,1.5rem+2.2vw,3rem)] leading-[1.08] tracking-[-0.01em] text-cloth-ink">{title}</h1>
        <p className="mt-3 max-w-[40ch] text-[1.0625rem] leading-relaxed text-cloth-ink/70">{subtitle}</p>
      </div>
    </div>
  );
}
