"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { BookDTO, BookStatus } from "@/shared/validation/book";
import { GENRE_KEYS } from "@/shared/genres";
import { FieldLabel } from "@/ui/FieldLabel";
import { MultiSelect } from "@/ui/MultiSelect";
import { TextField } from "@/ui/TextField";
import { booksApi } from "./api";
import { BookCard } from "./BookCard";

const STATUS_VALUES: BookStatus[] = ["want_to_read", "currently_reading", "read", "did_not_finish"];
const RATING_VALUES = [5, 4, 3, 2, 1] as const;

const DEFAULTS = { search: "", status: "all" as const, genres: [] as string[], minRating: "all" as const };

/**
 * The library grid, with search and a single combined Status/Genre/Rating filter panel — always visible, even
 * for a one-book library, since this is the whole point of the page rather than incidental chrome. All
 * client-side over the already-fetched list (a personal library is small enough that there's no need for server
 * round-trips per keystroke); the list keeps the server's own `sortOrder` throughout, since filtering never
 * reorders. Genre options are built from whatever genres actually appear across the user's own books, since a
 * book's genres are free text (a translated pick from the fixed list, a custom tag, or both mixed) rather than
 * a stable enum — see `AddBookForm` — and then joined by every genre in our own list. Genre is a multi-select
 * dropdown rather than Status/Rating's single-select: a book
 * can carry several genres at once, so picking more than one here is "show books in any of these" (OR, not AND) —
 * the natural reading of ticking several boxes.
 *
 * Drag-and-drop reordering (2+ books) only ever activates while no search or filter is narrowing the grid —
 * reordering a filtered subset wouldn't map cleanly back onto the full library's order, so it's full-list-only,
 * same as the server's own `sortOrder` it's built on. Dropping one card directly on another swaps just those two
 * (not a shift of everything between them). A successful drop calls `router.refresh()` rather than reordering the
 * local array itself, so the grid always reflects the server's own order exactly (the same pattern
 * `DeleteBookButton` already uses) instead of risking local state drifting from it.
 */
export function BooksCollection({ books, action }: { books: BookDTO[]; action?: ReactNode }) {
  const t = useTranslations("books.filters");
  const ts = useTranslations("books.add.fields.status");
  const tg = useTranslations("genres");
  const router = useRouter();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState<string>(DEFAULTS.search);
  const [status, setStatus] = useState<"all" | BookStatus>(DEFAULTS.status);
  const [genres, setGenres] = useState<string[]>(DEFAULTS.genres);
  const [minRating, setMinRating] = useState<"all" | (typeof RATING_VALUES)[number]>(DEFAULTS.minRating);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const uid = useId();
  const statusId = `${uid}-status`;
  const ratingId = `${uid}-rating`;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const statusLabel: Record<BookStatus, string> = {
    want_to_read: ts("wantToRead"),
    currently_reading: ts("currentlyReading"),
    read: ts("read"),
    did_not_finish: ts("didNotFinish"),
  };

  // Our whole genre list (the same names Add Book stores), plus any custom genre a book already carries — so a
  // reader can pick any genre, not only the ones their current books happen to use.
  const genreOptions = useMemo(() => {
    const all = new Set<string>(GENRE_KEYS.map((key) => tg(key)));
    for (const book of books) for (const genre of book.genres) all.add(genre);
    return Array.from(all)
      .sort((a, b) => a.localeCompare(b))
      .map((genre) => ({ value: genre, label: genre }));
  }, [books, tg]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    return books.filter((b) => {
      if (q && !b.title.toLocaleLowerCase().includes(q) && !b.author.toLocaleLowerCase().includes(q)) return false;
      if (status !== "all" && b.status !== status) return false;
      if (genres.length > 0 && !b.genres.some((g) => genres.includes(g))) return false;
      if (minRating !== "all" && (b.rating == null || b.rating < minRating)) return false;
      return true;
    });
  }, [books, search, status, genres, minRating]);

  function clearFilters() {
    setStatus(DEFAULTS.status);
    setGenres(DEFAULTS.genres);
    setMinRating(DEFAULTS.minRating);
  }

  const activeFilterCount = [status !== "all", genres.length > 0, minRating !== "all"].filter(Boolean).length;
  const hasActiveFilters = search !== "" || activeFilterCount > 0;
  const canReorder = !hasActiveFilters && books.length >= 2;

  function clearDrag() {
    setDragId(null);
    setOverId(null);
  }

  async function handleDrop(targetId: string) {
    const sourceId = dragId;
    clearDrag();
    if (!sourceId || sourceId === targetId || busy) return;
    setBusy(true);
    try {
      await booksApi.reorder(sourceId, { targetId });
      router.refresh();
    } catch {
      // A failed reorder is a no-op worth quietly ignoring, not an error dialog — the grid just stays put, and
      // dragging is reachable again immediately below for another try.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] flex-1">
          <TextField label={t("searchLabel")} hideLabel placeholder={t("searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div ref={root} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="control flex h-[3.125rem] items-center gap-2 px-4 text-[0.9375rem] text-ink"
          >
            {t("filtersLabel")}
            {activeFilterCount > 0 ? <span className="grid size-5 place-items-center rounded-full bg-ink text-xs font-medium text-paper">{activeFilterCount}</span> : null}
            <ChevronDown className={`size-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {open ? (
            <div className="popover absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[16rem] rounded-xl p-4">
              <div className="flex flex-col gap-4">
                <div>
                  <FieldLabel htmlFor={statusId}>{t("statusLabel")}</FieldLabel>
                  <div className="control relative">
                    <select id={statusId} value={status} onChange={(e) => setStatus(e.target.value as "all" | BookStatus)}>
                      <option value="all">{t("allStatuses")}</option>
                      {STATUS_VALUES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
                  </div>
                </div>

                <MultiSelect
                  label={t("genreLabel")}
                  name="genres"
                  placeholder={t("allGenres")}
                  summary={(count) => t("genresSelected", { count })}
                  listLabel={t("genreLabel")}
                  options={genreOptions}
                  value={genres}
                  onChange={setGenres}
                  max={genreOptions.length}
                  onLimit={() => {}}
                  removeLabel={(name) => name}
                  hideChips
                />

                <div>
                  <FieldLabel htmlFor={ratingId}>{t("ratingLabel")}</FieldLabel>
                  <div className="control relative">
                    <select
                      id={ratingId}
                      value={String(minRating)}
                      onChange={(e) => setMinRating(e.target.value === "all" ? "all" : (Number(e.target.value) as (typeof RATING_VALUES)[number]))}
                    >
                      <option value="all">{t("allRatings")}</option>
                      {RATING_VALUES.map((r) => (
                        <option key={r} value={r}>
                          {t("ratingAndUp", { count: r })}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
                  </div>
                </div>

                {activeFilterCount > 0 ? (
                  <button type="button" onClick={clearFilters} className="self-start text-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                    {t("clear")}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {action}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-[1.0625rem] text-muted">{t("noResults")}</p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearch(DEFAULTS.search);
                clearFilters();
              }}
              className="text-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline"
            >
              {t("clear")}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              draggable={canReorder && !busy}
              dragState={dragId === book.id ? "dragging" : overId === book.id ? "over" : undefined}
              onDragStart={() => setDragId(book.id)}
              onDragEnter={() => {
                if (dragId && dragId !== book.id) setOverId(book.id);
              }}
              onDrop={() => handleDrop(book.id)}
              onDragEnd={clearDrag}
            />
          ))}
        </div>
      )}
    </div>
  );
}
