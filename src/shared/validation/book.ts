import { z } from "zod";
import { LIMITS } from "./limits";
import { VALIDATION_KEYS as K } from "./keys";

export const BOOK_STATUSES = ["want_to_read", "currently_reading", "read", "did_not_finish"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

/** Collapse inner whitespace; used for every free-text tag (genres, characters) so casing/spacing quirks don't
 *  create near-duplicate tags. */
const normalizeTag = (s: string) => s.trim().replace(/\s+/g, " ");

/** Case-insensitive de-duplication that keeps the first spelling and the original order (same rule as Favorite
 *  Authors in onboarding, reimplemented here to keep this file self-contained). */
function dedupeCaseInsensitive(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Title and Author accept any script — unlike the account's own First/Last Name, a book's title or author is
// never Latin-restricted.
const titleField = z
  .string({ error: K.required })
  .trim()
  .min(1, { error: K.required, abort: true })
  .max(LIMITS.bookTitleMax, { error: K.bookTitleTooLong });

const authorField = z
  .string({ error: K.required })
  .trim()
  .min(1, { error: K.required, abort: true })
  .max(LIMITS.bookAuthorMax, { error: K.bookAuthorTooLong });

const genreTag = z
  .string()
  .transform(normalizeTag)
  .pipe(z.string().min(1).max(LIMITS.bookGenreMax, { error: K.genreTagTooLong }));

const characterName = z
  .string()
  .transform(normalizeTag)
  .pipe(z.string().min(1).max(LIMITS.characterMax, { error: K.characterTooLong }));

const quoteField = z.object({
  text: z
    .string({ error: K.required })
    .trim()
    .min(1, { error: K.required, abort: true })
    .max(LIMITS.quoteTextMax, { error: K.quoteTooLong }),
  // An empty page field arrives as null from the UI, never as an empty string.
  page: z.number().int().min(1).max(1_000_000).nullable().optional(),
});

/**
 * The Add/Edit Book form. Title, Author and Status are the only required fields. Rating is required exactly when
 * Status is "read" and forbidden otherwise (the star widget stays visible but inactive for the other three
 * statuses — the UI simply never sends a value for them). Every other field is free-form and optional.
 */
export const bookSchema = z
  .object({
    title: titleField,
    author: authorField,
    status: z.enum(BOOK_STATUSES, { error: K.required }),
    rating: z.number().min(1).max(5).multipleOf(0.5).nullable(),
    genres: z.array(genreTag).max(LIMITS.bookGenresMax, { error: K.tooManyGenres }).transform(dedupeCaseInsensitive),
    plot: z
      .string()
      .transform((t) => t.trim())
      .pipe(z.string().max(LIMITS.plotMax, { error: K.plotTooLong })),
    characters: z.array(characterName).max(LIMITS.charactersMax, { error: K.tooManyCharacters }).transform(dedupeCaseInsensitive),
    quotes: z.array(quoteField).max(LIMITS.quotesMax, { error: K.tooManyQuotes }),
    commentary: z
      .string()
      .transform((t) => t.trim())
      .pipe(z.string().max(LIMITS.commentaryMax, { error: K.commentaryTooLong })),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === "read" && value.rating === null) {
      ctx.addIssue({ code: "custom", path: ["rating"], message: K.ratingRequired });
    }
    if (value.status !== "read" && value.rating !== null) {
      // The star widget is inactive outside "read"; a value here means the client sent stale state, not a real rating.
      ctx.addIssue({ code: "custom", path: ["rating"], message: K.ratingRequired });
    }
  });

export type BookInput = z.infer<typeof bookSchema>;

/** AI autofill request: only Title is required (Author helps disambiguate when already typed). */
export const bookAiFillSchema = z.object({ title: titleField, author: z.string().trim().max(LIMITS.bookAuthorMax).optional() }).strict();
export type BookAiFillInput = z.infer<typeof bookAiFillSchema>;

/** Dragging a library card onto another one: swaps the two books' positions directly. */
export const bookReorderSchema = z.object({ targetId: z.string().min(1) }).strict();
export type BookReorderInput = z.infer<typeof bookReorderSchema>;

/** What "Fill with AI" hands back. A missing/unrecognized field is null (or an empty list) — never guessed. */
export interface BookAiFillResult {
  author: string | null;
  genres: string[];
  characters: string[];
  plot: string | null;
}

export interface QuoteDTO {
  text: string;
  page: number | null;
}

/**
 * The client-visible shape of a saved book. Shared by the server (its own record type adds real `Date` fields on
 * top of this) and the browser (which only ever sees the JSON wire format — dates arrive as ISO strings).
 */
export interface BookDTO {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  rating: number | null;
  genres: string[];
  plot: string | null;
  characters: string[];
  quotes: QuoteDTO[];
  commentary: string | null;
  /** A local path (uploaded from the reader's device) or an external https URL (Google Books lookup). Null
   *  until a cover is set — the UI shows a placeholder. */
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Accepted cover image types and the upload size cap, shared by the client (pre-check before sending) and the
 *  server (the actual guard). */
export const COVER_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const COVER_EXTENSION: Record<(typeof COVER_MIME_TYPES)[number], string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
