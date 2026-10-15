/**
 * Skeleton bodies for the signed-in pages' `loading.tsx` files. Each one is drawn inside the real `AppFrame`
 * (sidebar, header, section backdrop — all identical to the finished page), so a click on a nav item responds
 * the instant it happens: the shell is already the right one and only the content area fills in a moment later.
 * They are rough silhouettes of the page they stand in for, not copies — enough that nothing jumps when the real
 * page arrives.
 *
 * Drawn in a soft tint of the page's own ink (not the form skeleton's `--rule`, which all but vanishes on the
 * warm section backdrops) with a slow pulse.
 */
const bar = "animate-pulse rounded-xl bg-ink/10";
const block = "animate-pulse rounded-3xl bg-ink/10";

/** Books: the shelf hero band, then a grid of cover-shaped cards. */
export function BooksLoading() {
  return (
    <div aria-hidden="true">
      <div className="-mx-5 -mt-12 h-[16rem] animate-pulse bg-ink/10 sm:-mx-8 sm:-mt-20 sm:h-[20rem] lg:h-[14.5rem]" />
      <div className="mt-12 grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-ink/10" />
        ))}
      </div>
    </div>
  );
}

/** A single form page (add / edit a book or a thought): heading, then fields. */
export function FormLoading() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-2xl lg:mt-[3.75rem]">
      <div className={`${bar} h-12 w-2/5`} />
      <div className="mt-9 flex flex-col gap-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className={`${bar} h-[4.6rem]`} />
          <div className={`${bar} h-[4.6rem]`} />
        </div>
        <div className={`${bar} h-[4.6rem]`} />
        <div className={`${bar} h-40`} />
        <div className={`${bar} h-[3.125rem] w-40`} />
      </div>
    </div>
  );
}

/** Thoughts, About Me and Settings: the open book — two pages side by side on desktop. */
export function BookPagesLoading() {
  return (
    <div aria-hidden="true" className="max-w-5xl lg:max-w-[min(64rem,calc(100%-9rem))]">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={`${block} h-[26rem]`} />
        <div className={`${block} h-[26rem]`} />
      </div>
    </div>
  );
}

/** Mystery Book (a dark scene): the hero card, in a light tint of its own. */
export function MysteryLoading() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-5xl">
      <div className="h-[22rem] animate-pulse rounded-[2rem] bg-white/10" />
    </div>
  );
}

/** The hub page: the open book. */
export function HubLoading() {
  return (
    <div aria-hidden="true" className="max-w-4xl lg:ml-[4.5rem]">
      <div className={`${block} h-[28rem]`} />
    </div>
  );
}
