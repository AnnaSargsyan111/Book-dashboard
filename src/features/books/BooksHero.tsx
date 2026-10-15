import { BookshelfScene } from "@/ui/scenes/BookshelfScene";

/**
 * Books' own hero: a drawn shelf of books (`BookshelfScene`, the app's own warm tokens, not a photograph) behind
 * a frosted-glass panel carrying the title — `.shelf-glass`'s `backdrop-filter` blur, so the shelf stays visibly,
 * softly there behind the text rather than being hidden under an opaque card. The one hero in the app still built
 * this way; every other section already turned the same corner (see `globals.css`'s own note where the shared
 * `.hero-band`/`.photo-hero-overlay` classes used to live).
 */
/** `compact` is for the empty library: on desktop the hero gives up some height so that the whole empty page fits one
 *  screen without scrolling. */
export function BooksHero({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  return (
    <div className={`shelf-hero relative -mx-5 -mt-12 flex min-h-[16rem] items-center overflow-hidden sm:-mx-8 sm:-mt-20 sm:min-h-[20rem] lg:items-start lg:pt-7 ${compact ? "lg:min-h-[14.5rem]" : ""}`}>
      <div className="shelf-grain" aria-hidden="true" />
      <BookshelfScene className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] w-full" />
      <div className="shelf-glass relative mx-5 max-w-[26rem] rounded-[1.5rem] px-6 py-7 sm:mx-8 sm:px-8 sm:py-9">
        <h1 className="max-w-[18ch] text-balance font-display text-[clamp(1.75rem,1.35rem+1.8vw,2.5rem)] leading-[1.1] tracking-[-0.01em] text-ink">{title}</h1>
        <p className="mt-3 max-w-[36ch] text-[0.9375rem] leading-relaxed text-ink-2">{subtitle}</p>
      </div>
    </div>
  );
}
