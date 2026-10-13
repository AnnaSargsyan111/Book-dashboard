import { ApiError } from "@/server/http/errors";
import { errorMessage, log } from "@/server/log";

const API_URL = "https://openlibrary.org/search.json";

interface OpenLibraryResponse {
  docs?: Array<{ cover_i?: number }>;
}

/**
 * "Find cover": a real internet lookup via Open Library's free public API, by title + author — not an
 * AI-generated image. Open Library needs no key and no billing account at all (unlike Google Books, which this
 * used to call — Google gates full backend routing behind a linked billing account even on its free tier, which
 * made "Find Cover" unreliable for anyone who hadn't set that up; see the README). Never fabricates anything — a
 * book it can't find just means no cover. Throws `COVER_NOT_FOUND` when nothing usable turns up.
 */
export async function lookUpCover(title: string, author: string): Promise<string> {
  const params = new URLSearchParams({ title, author, limit: "1", fields: "cover_i" });
  let res: Response;
  try {
    res = await fetch(`${API_URL}?${params}`, { signal: AbortSignal.timeout(10_000) });
  } catch (e) {
    log.error("cover lookup: request failed", { message: errorMessage(e) });
    throw new ApiError("COVER_NOT_FOUND", 502);
  }
  if (!res.ok) {
    log.error("cover lookup: Open Library responded with an error", { status: res.status });
    throw new ApiError("COVER_NOT_FOUND", 502);
  }

  const data = (await res.json()) as OpenLibraryResponse;
  const coverId = data.docs?.[0]?.cover_i;
  if (!coverId) throw new ApiError("COVER_NOT_FOUND", 404);

  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}
