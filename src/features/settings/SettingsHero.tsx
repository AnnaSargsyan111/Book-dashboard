import Image from "next/image";

/**
 * Settings' own hero — deliberately the quietest of the five: a short band, a flatter scrim
 * (`.photo-hero-overlay-quiet`, no candle-warm glow), and just the eyebrow + title (the page's existing
 * `subtitle` stays exactly where and how it already was, in the ivory content area below). This is a
 * utilitarian account-settings page, not an editorial moment — "premium" here means restrained, carrying the
 * same real-photograph treatment every other section now has without turning it into another dramatic
 * full-bleed banner.
 */
export function SettingsHero({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="hero-band -mx-5 -mt-12 flex min-h-[9rem] flex-col justify-center px-5 py-7 sm:-mx-8 sm:-mt-20 sm:min-h-[11rem] sm:px-8 sm:py-9">
      <Image src="/images/settings-hero.jpg" alt="" fill priority sizes="(min-width: 64rem) 56rem, 100vw" className="object-cover" style={{ objectPosition: "22% 48%" }} />
      <div className="photo-hero-overlay-quiet" aria-hidden="true" />
      <div className="relative max-w-[70%]">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-cloth-ink/60">{eyebrow}</p>
        <h1 className="mt-1.5 max-w-[16ch] text-balance font-display text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)] leading-[1.12] tracking-[-0.01em] text-cloth-ink">{title}</h1>
      </div>
    </div>
  );
}
