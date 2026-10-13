"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { bookDetailPath } from "@/shared/routes";
import type { BookDTO, BookStatus } from "@/shared/validation/book";
import { CoverImage } from "@/ui/CoverImage";
import { StarRating } from "@/ui/StarRating";
import { StatusBadge } from "@/ui/StatusBadge";
import { DeleteBookButton } from "./DeleteBookButton";

/**
 * One card per book, cover forward: title, author, status, rating and up to two genre tags all live directly on
 * the cover itself — behind a warm dark scrim fading up from the bottom, the way a real book jacket carries its
 * own title — rather than as a separate text block below it. A quick-delete circle (deliberately understated:
 * near-transparent until hovered) floats over the top-right corner. The whole card is a link to Book Detail
 * (every field editable in place there — no separate edit mode); a soft lift on hover (desktop) is the only
 * affordance needed to read it as clickable. Client-side (it takes `BookDTO`, so it can live inside
 * `BooksCollection`'s filtered/sorted list); the delete icon is its own small client island regardless.
 *
 * `draggable` (only ever true from `BooksCollection` when the library has 2+ books and no search/filter is
 * narrowing the grid — reordering a filtered subset wouldn't map cleanly back onto the full library's order) puts
 * the card itself behind native HTML5 drag-and-drop: pick it up and drop it directly on another card to swap the
 * two. `draggable={false}` on the inner `Link` is what stops the browser's own link-drag (the ghost "drag this
 * URL" preview) from hijacking the gesture, letting the drag start from the card instead.
 */
export function BookCard({
  book,
  draggable,
  dragState,
  onDragStart,
  onDragEnter,
  onDrop,
  onDragEnd,
}: {
  book: BookDTO;
  draggable?: boolean;
  /** "dragging": this is the card currently being picked up. "over": another card is being dragged over this
   *  one and dropping now would swap with it. Undefined the rest of the time. */
  dragState?: "dragging" | "over";
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
}) {
  const t = useTranslations("books.card");
  const ts = useTranslations("books.add.fields.status");
  const statusLabel: Record<BookStatus, string> = {
    want_to_read: ts("wantToRead"),
    currently_reading: ts("currentlyReading"),
    read: ts("read"),
    did_not_finish: ts("didNotFinish"),
  };

  return (
    <article
      draggable={draggable}
      aria-label={draggable ? t("dragLabel", { title: book.title }) : undefined}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", book.id);
        onDragStart?.();
      }}
      onDragOver={(e) => {
        if (!draggable) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDragEnter={(e) => {
        if (!draggable) return;
        e.preventDefault();
        onDragEnter?.();
      }}
      onDrop={(e) => {
        if (!draggable) return;
        e.preventDefault();
        onDrop?.();
      }}
      onDragEnd={() => onDragEnd?.()}
      className={`group relative transition-[opacity,transform] duration-150 ease-out ${draggable ? "cursor-grab active:cursor-grabbing" : ""} ${
        dragState === "dragging" ? "opacity-40" : ""
      } ${dragState === "over" ? "scale-[1.03]" : ""}`}
    >
      <Link
        href={bookDetailPath(book.id)}
        draggable={false}
        className={`block overflow-hidden rounded-xl shadow-[0_2px_14px_-6px_rgb(0_0_0/0.18)] transition-[transform,box-shadow] duration-300 ease-out focus-visible:outline-offset-4 group-hover:shadow-[0_20px_36px_-14px_rgb(0_0_0/0.3)] sm:rounded-2xl ${
          draggable ? "" : "lg:hover:-translate-y-1"
        } ${dragState === "over" ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : ""}`}
      >
        <CoverImage
          src={book.coverUrl}
          title={book.title}
          alt=""
          overlay={
            <>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <StatusBadge status={book.status} label={statusLabel[book.status]} tone="dark" />
                {book.status === "read" && book.rating != null ? <StarRating label={statusLabel.read} value={book.rating} size="sm" /> : null}
              </div>
              <h3 className="line-clamp-2 text-balance font-display text-[0.9375rem] leading-snug text-white sm:text-[1.0625rem]">{book.title}</h3>
              <p className="line-clamp-1 text-xs text-white/75 sm:text-sm">{book.author}</p>
              {book.genres.length ? (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {book.genres.slice(0, 2).map((g) => (
                    <span key={g} className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[0.625rem] text-white/85 backdrop-blur-sm">
                      {g}
                    </span>
                  ))}
                </div>
              ) : null}
            </>
          }
        />
      </Link>

      <div className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5">
        <DeleteBookButton id={book.id} title={book.title} variant="overlay" />
      </div>
    </article>
  );
}
