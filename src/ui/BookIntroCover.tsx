import type { ReactNode } from "react";

/**
 * The closed book of the hub's entrance, as plain markup (no hooks) so the very same picture can be drawn in two
 * places: by `BookIntro` on the hub page, and by the hub's `loading.tsx` while that page is still being built —
 * which is what lets the book appear the instant someone logs in, instead of an in-between page. Both draw it on
 * the same `.book-intro-backdrop`, so handing over from one to the other doesn't change a pixel.
 */
export function BookIntroCover({ eyebrow, title, intro, open = false }: { eyebrow: string; title: ReactNode; intro: string; open?: boolean }) {
  return (
    <>
      <div className="book-intro-glow" data-open={open || undefined} />
      <div className="book-intro-stage relative aspect-[3/4] w-[min(22rem,86vw)]">
        <div className="book-intro-pages" />
        <div className="book-intro-cover cloth relative flex flex-col items-center justify-center px-7 py-10 text-center sm:px-10" data-open={open || undefined}>
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-cloth-ink/60">{eyebrow}</p>
          <h1 className="mt-3 max-w-[16ch] text-balance font-display text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.12] tracking-[-0.01em] text-cloth-ink">{title}</h1>
          <p className="mt-4 max-w-[26ch] text-[0.9375rem] leading-relaxed text-cloth-ink/70">{intro}</p>
        </div>
      </div>
    </>
  );
}
