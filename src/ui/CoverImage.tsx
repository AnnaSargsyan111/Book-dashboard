"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A book's cover — or, when there isn't one yet, a bookplate-style placeholder: a warm gradient, an inset frame
 * line and the title's own first letter in the display face. Deliberately designed, not a broken-image icon or
 * an empty box. `src` can be a local upload path or an external https URL (the Google Books lookup); sizing is
 * entirely up to the caller's container (this always fills it, at a classic 2:3 book-cover ratio).
 *
 * `overlay`, when given, sits directly on the cover behind a warm dark scrim fading up from the bottom — the
 * library grid's card metadata lives here, ON the cover itself, the way a real book's own jacket carries its
 * title. Omit it (Book Detail's own, larger cover) and the cover is shown plain.
 *
 * A `src` that doesn't load (a dead link, a blocked host) falls back to the same placeholder, so a broken-image icon
 * never shows.
 */
export function CoverImage({ src, title, alt, overlay }: { src: string | null; title: string; alt: string; overlay?: ReactNode }) {
  const initial = title.trim().charAt(0).toUpperCase() || "?";
  // Remember WHICH url failed (not just "failed"), so a new `src` is tried afresh without any reset effect.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  // An image that already failed before React attached `onError` (server-rendered markup) never fires it again.
  useEffect(() => {
    const img = imgRef.current;
    if (src && img?.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);

  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-surface">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- covers may be an arbitrary external URL
        <img ref={imgRef} src={src ?? undefined} alt={alt} onError={() => setFailedSrc(src)} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
      ) : (
        <div
          className="relative h-full w-full"
          style={{ background: "linear-gradient(155deg, var(--scene-parchment), var(--scene-ivory))" }}
        >
          <span className="absolute inset-3 rounded-lg border" style={{ borderColor: "color-mix(in oklab, var(--scene-walnut) 28%, transparent)" }} aria-hidden="true" />
          <span
            className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 font-display text-[2.5rem] italic leading-none"
            style={{ color: "color-mix(in oklab, var(--scene-walnut) 55%, transparent)" }}
            aria-hidden="true"
          >
            {initial}
          </span>
        </div>
      )}

      {overlay ? (
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 px-3 pb-3 pt-10 sm:px-3.5 sm:pb-3.5"
          style={{ background: "linear-gradient(to top, rgba(36,24,18,0.94) 0%, rgba(36,24,18,0.62) 58%, rgba(36,24,18,0) 100%)" }}
        >
          {overlay}
        </div>
      ) : null}
    </div>
  );
}
