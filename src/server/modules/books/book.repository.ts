import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/server/db/client";
import { deleteCoverUpload } from "@/server/files/cover-storage";
import type { BookDTO, BookInput, BookStatus, QuoteDTO } from "@/shared/validation/book";

/** The server's own record: identical to the client-visible `BookDTO`, except `createdAt`/`updatedAt` are real
 *  `Date` instances here (they only become ISO strings once the route factory JSON-serializes the response). */
export type BookRecord = Omit<BookDTO, "createdAt" | "updatedAt"> & { createdAt: Date; updatedAt: Date };

interface BookRow {
  id: string;
  title: string;
  author: string;
  status: string;
  rating: number | null;
  genres: unknown;
  plot: string | null;
  characters: unknown;
  quotes: unknown;
  commentary: string | null;
  coverUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toBookRecord(row: BookRow): BookRecord {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    status: row.status as BookStatus,
    rating: row.rating,
    genres: row.genres as string[],
    plot: row.plot,
    characters: row.characters as string[],
    quotes: row.quotes as QuoteDTO[],
    commentary: row.commentary,
    coverUrl: row.coverUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** By `sortOrder`, newest-first among ties (which is every book added before manual reordering existed, and
 *  every book added since that has never been moved — `createdAt desc` as the tiebreaker reproduces exactly the
 *  grid order the page already had before "move left/right" existed, with no backfill migration needed). */
export async function listBooks(userId: string): Promise<BookRecord[]> {
  const rows = await getDb().book.findMany({ where: { userId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return rows.map(toBookRecord);
}

/** A single book, scoped to its owner — never resolves someone else's book, even by a guessed id. */
export async function getBook(userId: string, id: string): Promise<BookRecord | null> {
  const row = await getDb().book.findFirst({ where: { id, userId } });
  return row ? toBookRecord(row) : null;
}

/** The library entry a Mystery Book recommendation already became, if any — the idempotency check for "+ Add"
 *  (see `POST /api/v1/mystery/recommendation-view/:id/add-to-library`), so pressing it twice (or a lagging card)
 *  is a no-op, not a duplicate or an error. Not ownership-scoped: the caller's own lookup of the recommendation
 *  already covers that. */
export async function findBookByRecommendationView(viewId: string): Promise<BookRecord | null> {
  const row = await getDb().book.findFirst({ where: { sourceMysteryViewId: viewId } });
  return row ? toBookRecord(row) : null;
}

/** `fromRecommendationView` is only ever passed by the Mystery Book → Recently Recommended → "+ Add" path (see
 *  `POST /api/v1/mystery/recommendation-view/:id/add-to-library`) — it sets the real catalog cover and links the
 *  new book back to the recommendation that produced it, atomically with creation, rather than a second write a
 *  client could lose. Every other caller (the ordinary Add Book form) omits it and behaves exactly as before. */
export async function createBook(userId: string, input: BookInput, fromRecommendationView?: { viewId: string; coverUrl: string | null }): Promise<BookRecord> {
  const quotes: QuoteDTO[] = input.quotes.map((q) => ({ text: q.text, page: q.page ?? null }));
  // One below the current lowest `sortOrder`, so a freshly added book always leads the grid — the same
  // newest-first placement the page always had, now expressed as a `sortOrder` value instead of `createdAt`.
  const { _min } = await getDb().book.aggregate({ where: { userId }, _min: { sortOrder: true } });
  const sortOrder = (_min.sortOrder ?? 0) - 1;
  const row = await getDb().book.create({
    data: {
      userId,
      title: input.title,
      author: input.author,
      status: input.status,
      rating: input.rating,
      genres: input.genres,
      plot: input.plot || null,
      characters: input.characters,
      quotes: quotes as unknown as Prisma.InputJsonValue,
      commentary: input.commentary || null,
      coverUrl: fromRecommendationView?.coverUrl ?? null,
      sourceMysteryViewId: fromRecommendationView?.viewId ?? null,
      sortOrder,
    },
  });
  return toBookRecord(row);
}

/** Dragging a card onto another one (Books page grid, 2+ books only): swaps those two cards' positions. Rather
 *  than swapping just the two rows' raw `sortOrder` values, this re-reads the user's whole library in its
 *  current display order, swaps the two target ids within that ordered list, and rewrites every book's
 *  `sortOrder` to its new sequential index. A plain two-value swap would silently no-op whenever the two cards
 *  tie on `sortOrder` — every book added before this feature existed defaults to 0, so two never-yet-moved books
 *  are *always* a tie — and this also self-heals that: once a library has been through one swap, every book has
 *  a distinct `sortOrder`, so ties (and this full rewrite) never recur. A personal library is small enough that
 *  rewriting all of it is cheap. Both ids must belong to `userId`, or nothing is written; returns whether the
 *  swap happened, so the route can answer 404 either way without distinguishing "not yours" from "doesn't
 *  exist" (same ownership-scoping convention as the rest of this file). */
export async function swapBookOrder(userId: string, idA: string, idB: string): Promise<boolean> {
  const rows = await getDb().book.findMany({ where: { userId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], select: { id: true } });
  const ids = rows.map((r) => r.id);
  const indexA = ids.indexOf(idA);
  const indexB = ids.indexOf(idB);
  if (indexA === -1 || indexB === -1) return false;

  ids[indexA] = idB;
  ids[indexB] = idA;
  await getDb().$transaction(ids.map((id, index) => getDb().book.update({ where: { id }, data: { sortOrder: index } })));
  return true;
}

/** Full-field update (title/author/status/rating/genres/plot/characters/quotes/commentary) — the same shape as
 *  creating one, since Book Detail edits every field in place. Returns null if the book doesn't exist or belongs
 *  to someone else, so the route can answer with a plain 404 either way. */
export async function updateBook(userId: string, id: string, input: BookInput): Promise<BookRecord | null> {
  const existing = await getDb().book.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return null;
  const quotes: QuoteDTO[] = input.quotes.map((q) => ({ text: q.text, page: q.page ?? null }));
  const row = await getDb().book.update({
    where: { id },
    data: {
      title: input.title,
      author: input.author,
      status: input.status,
      rating: input.rating,
      genres: input.genres,
      plot: input.plot || null,
      characters: input.characters,
      quotes: quotes as unknown as Prisma.InputJsonValue,
      commentary: input.commentary || null,
    },
  });
  return toBookRecord(row);
}

/** Sets or clears the cover — a local upload path or an external https URL. Same ownership scoping as update. */
export async function setBookCover(userId: string, id: string, coverUrl: string | null): Promise<BookRecord | null> {
  const existing = await getDb().book.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return null;
  const row = await getDb().book.update({ where: { id }, data: { coverUrl } });
  return toBookRecord(row);
}

/** True if a book was actually deleted (false for someone else's book or an id that never existed). Also
 *  removes any locally-uploaded cover file for it (a no-op if it never had one). */
export async function deleteBook(userId: string, id: string): Promise<boolean> {
  const { count } = await getDb().book.deleteMany({ where: { id, userId } });
  if (count > 0) await deleteCoverUpload(userId, id);
  return count > 0;
}
