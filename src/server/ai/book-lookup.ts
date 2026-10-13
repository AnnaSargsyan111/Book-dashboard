import { getEnv } from "@/server/config/env";
import { ApiError } from "@/server/http/errors";
import { errorMessage, log } from "@/server/log";
import { LIMITS } from "@/shared/validation/limits";
import type { BookAiFillInput, BookAiFillResult } from "@/shared/validation/book";

const API_URL = "https://www.googleapis.com/books/v1/volumes";

/** Google Books' backend occasionally answers a perfectly good request with a transient `503` — not a quota
 *  problem (that's a `429`, and not worth retrying), just a backend hiccup that a moment later succeeds. Two
 *  short retries absorb that without the user ever seeing "couldn't find this book" for one of theirs that's
 *  very much in the catalog. A `429` or any other 4xx is a real answer, not a hiccup, so those return immediately. */
const RETRY_DELAYS_MS = [400, 900];

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (res.ok || res.status < 500) return res;
      lastError = new Error(`Google Books responded ${res.status}`);
    } catch (e) {
      lastError = e;
    }
    const delay = RETRY_DELAYS_MS[attempt];
    if (delay !== undefined) await new Promise((r) => setTimeout(r, delay));
  }
  throw lastError;
}

interface GoogleBooksResponse {
  items?: Array<{ volumeInfo?: { authors?: string[]; categories?: string[]; description?: string } }>;
}

/** Breaks each Google Books category ("Fiction / Mystery & Detective / General") into its own short tags, deduped
 *  case-insensitively — the genre field here is free-form (not restricted to `GENRE_KEYS`), the same as a tag a
 *  person types in by hand. */
function tagsFromCategories(categories: string[] | undefined): string[] {
  if (!categories) return [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const category of categories) {
    for (const part of category.split("/")) {
      const tag = part.trim();
      if (!tag || seen.has(tag.toLocaleLowerCase())) continue;
      seen.add(tag.toLocaleLowerCase());
      tags.push(tag);
    }
  }
  return tags.slice(0, 4);
}

/** Google Books descriptions occasionally carry basic HTML (`<p>`, `<b>`, line breaks); stripped here since Plot
 *  is a plain-text field. Truncated defensively at the form's own limit — descriptions this long are rare, but a
 *  publisher's blurb should never be able to fail the save the autofill itself offered. */
function plainTextPlot(description: string | undefined): string | null {
  if (!description) return null;
  const text = description
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > LIMITS.plotMax ? `${text.slice(0, LIMITS.plotMax - 1).trimEnd()}…` : text;
}

/**
 * Looks a book up via Google Books' public API — the same real internet lookup "Find Cover" already uses (see
 * `cover-lookup.ts`), reused here instead of a paid LLM call so "Auto-fill" needs no configuration to work out of
 * the box. Works keyless against Google's shared anonymous quota (which can run dry — it's a daily bucket shared
 * with every other keyless caller); `GOOGLE_BOOKS_API_KEY` (optional, see `.env.example`) switches to a private
 * quota instead. Never fabricates anything: a title Google Books has no record of just throws `AI_NO_MATCH`.
 * `characters` is always empty — no free structured source offers a cast list, and guessing one would break the
 * "never invent" rule this endpoint has always kept.
 */
export async function lookUpBook(input: BookAiFillInput): Promise<BookAiFillResult> {
  const q = encodeURIComponent(input.author ? `intitle:${input.title} inauthor:${input.author}` : `intitle:${input.title}`);
  const apiKey = getEnv().GOOGLE_BOOKS_API_KEY;
  const keyParam = apiKey ? `&key=${apiKey}` : "";

  let res: Response;
  try {
    res = await fetchWithRetry(`${API_URL}?q=${q}&maxResults=1${keyParam}`);
  } catch (e) {
    log.error("book lookup: request failed", { message: errorMessage(e) });
    throw new ApiError("AI_NO_MATCH", 502);
  }
  if (!res.ok) {
    log.error("book lookup: Google Books responded with an error", { status: res.status });
    throw new ApiError("AI_NO_MATCH", 502);
  }

  const data = (await res.json()) as GoogleBooksResponse;
  const volumeInfo = data.items?.[0]?.volumeInfo;
  if (!volumeInfo) throw new ApiError("AI_NO_MATCH", 404);

  return {
    author: volumeInfo.authors?.[0]?.trim() || null,
    genres: tagsFromCategories(volumeInfo.categories),
    characters: [],
    plot: plainTextPlot(volumeInfo.description),
  };
}
