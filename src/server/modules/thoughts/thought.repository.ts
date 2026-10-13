import { getDb } from "@/server/db/client";
import type { ThoughtDTO, ThoughtInput } from "@/shared/validation/thought";

/** The server's own record: identical to the client-visible `ThoughtDTO`, except `createdAt`/`updatedAt` are real
 *  `Date` instances here (they only become ISO strings once the route factory JSON-serializes the response). */
export type ThoughtRecord = Omit<ThoughtDTO, "createdAt" | "updatedAt"> & { createdAt: Date; updatedAt: Date };

interface ThoughtRow {
  id: string;
  title: string | null;
  text: string;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  book: { id: string; title: string; author: string } | null;
}

const bookSelect = { select: { id: true, title: true, author: true } } as const;

function toThoughtRecord(row: ThoughtRow): ThoughtRecord {
  return {
    id: row.id,
    title: row.title,
    text: row.text,
    favorite: row.favorite,
    book: row.book,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Newest first: a freshly captured thought is the first thing seen on the Thoughts page. */
export async function listThoughts(userId: string): Promise<ThoughtRecord[]> {
  const rows = await getDb().thought.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { book: bookSelect } });
  return rows.map(toThoughtRecord);
}

/** A single thought, scoped to its owner — never resolves someone else's, even by a guessed id. */
export async function getThought(userId: string, id: string): Promise<ThoughtRecord | null> {
  const row = await getDb().thought.findFirst({ where: { id, userId }, include: { book: bookSelect } });
  return row ? toThoughtRecord(row) : null;
}

/** Re-checks that `bookId` (if given) is really one of this user's own books before accepting the link — a
 *  guessed id for someone else's book must never be linkable. Returns the verified id, or null. */
async function verifiedBookId(userId: string, bookId: string | null): Promise<string | null> {
  if (!bookId) return null;
  const book = await getDb().book.findFirst({ where: { id: bookId, userId }, select: { id: true } });
  return book?.id ?? null;
}

export async function createThought(userId: string, input: ThoughtInput): Promise<ThoughtRecord> {
  const bookId = await verifiedBookId(userId, input.bookId);
  const row = await getDb().thought.create({
    data: { userId, title: input.title || null, text: input.text, favorite: input.favorite, bookId },
    include: { book: bookSelect },
  });
  return toThoughtRecord(row);
}

/** Full-field update (title/text/bookId/favorite) — the same shape as creating one, since a thought has no
 *  separate edit mode. Returns null if the thought doesn't exist or belongs to someone else, so the route can
 *  answer with a plain 404 either way. */
export async function updateThought(userId: string, id: string, input: ThoughtInput): Promise<ThoughtRecord | null> {
  const existing = await getDb().thought.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return null;
  const bookId = await verifiedBookId(userId, input.bookId);
  const row = await getDb().thought.update({
    where: { id },
    data: { title: input.title || null, text: input.text, favorite: input.favorite, bookId },
    include: { book: bookSelect },
  });
  return toThoughtRecord(row);
}

/** True if a thought was actually deleted (false for someone else's thought or an id that never existed). */
export async function deleteThought(userId: string, id: string): Promise<boolean> {
  const { count } = await getDb().thought.deleteMany({ where: { id, userId } });
  return count > 0;
}
