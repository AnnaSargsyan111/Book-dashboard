import { errorMessage, log } from "@/server/log";

const SEARCH_URL = "https://openlibrary.org/search.json";
const WORK_URL = "https://openlibrary.org";

/** Open Library answers a good request with an occasional transient `500`/`503`; two short retries absorb that so a
 *  book that is in the catalog never reads as "couldn't find this book". A 4xx is a real answer and returns at once. */
const RETRY_DELAYS_MS = [400, 900];

/** Open Library asks API callers to identify themselves; anonymous traffic is the first to be throttled. */
const HEADERS = { "User-Agent": "MystBook/1.0 (reading notebook)", Accept: "application/json" };

async function fetchJson<T>(url: string): Promise<T | null> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10_000) });
      if (res.ok) return (await res.json()) as T;
      if (res.status < 500) return null;
      lastError = new Error(`Open Library responded ${res.status}`);
    } catch (e) {
      lastError = e;
    }
    const delay = RETRY_DELAYS_MS[attempt];
    if (delay !== undefined) await new Promise((r) => setTimeout(r, delay));
  }
  log.error("open library: request failed", { message: errorMessage(lastError) });
  throw lastError;
}

export interface OpenLibraryWork {
  key: string;
  title: string;
  authors: string[];
  coverId: number | null;
  subjects: string[];
  /** The people (characters) librarians catalogued for this work: "Elizabeth Bennet", "Marianne Sheridan (fictional character)". */
  people?: string[];
}

interface SearchResponse {
  docs?: Array<{ key?: string; title?: string; author_name?: string[]; cover_i?: number; subject?: string[]; person?: string[] }>;
}

/** lower case, accents removed ("Saint-Exupéry" = "saint exupery", "Brontë" = "bronte"), punctuation turned into spaces */
const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Does one of the work's authors match what was typed? Tolerant of casing, initials and a surname-only entry. */
function authorMatches(work: OpenLibraryWork, author: string): boolean {
  const wanted = norm(author);
  if (!wanted) return false;
  return work.authors.some((a) => {
    const have = norm(a);
    return have === wanted || have.includes(wanted) || wanted.includes(have) || wanted.split(" ").every((part) => have.includes(part));
  });
}

/**
 * Searches Open Library with title + author as plain free text (`q=`). That ranks the well-known edition first —
 * "1984 george orwell" lands on *Nineteen Eighty-Four* — where the stricter `title=` / `author=` parameters match
 * only the literal title and bury it. An empty `author=` parameter also makes Open Library answer `500`, so none is
 * ever sent.
 */
export async function searchWorks(title: string, author?: string, limit = 8): Promise<OpenLibraryWork[]> {
  const params = new URLSearchParams({
    q: [title, author].filter(Boolean).join(" "),
    limit: String(limit),
    fields: "key,title,author_name,cover_i,subject,person",
  });
  const data = await fetchJson<SearchResponse>(`${SEARCH_URL}?${params}`);
  return (data?.docs ?? [])
    .filter((d) => d.key && d.title)
    .map((d) => ({
      key: d.key as string,
      title: d.title as string,
      authors: d.author_name ?? [],
      coverId: d.cover_i ?? null,
      subjects: d.subject ?? [],
      people: d.person ?? [],
    }));
}

const STOP_WORDS = new Set(["a", "an", "the", "of", "and", "in", "on", "to"]);

/** Two words that differ by at most one letter (a typo: "firm" / "farm"); short words must match exactly. */
function sameWord(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const restA = a.slice(i);
  const restB = b.slice(i);
  return restA.slice(1) === restB || restA === restB.slice(1) || restA.slice(1) === restB.slice(1);
}

/** How much of the TYPED title appears in the work's title (0..1), forgiving one-letter typos and ignoring "the", "of"... */
export function titleScore(workTitle: string, typed: string): number {
  const wanted = norm(typed).split(" ").filter((t) => t && !STOP_WORDS.has(t));
  if (!wanted.length) return 0;
  const have = norm(workTitle).split(" ").filter(Boolean);
  return wanted.filter((w) => have.some((h) => sameWord(w, h))).length / wanted.length;
}

/**
 * Is this work plausibly the book that was typed? Open Library's free-text search always returns SOMETHING, even for a
 * misspelt title (a search for "Animal firm George Orwell" returns Dracula's Guest), so a result counts only when most of
 * the typed title is in its title. The one exception: a title with a number in it ("1984") may be a book known by its
 * words ("Nineteen Eighty-Four"), so there the author alone is enough. The author never rescues a title that matches
 * nothing otherwise: "Animal firm" by Bram Stoker is "not found", never his Dracula's Guest. Anything else is "not
 * found", never somebody else's book or cover.
 */
export function isPlausible(work: OpenLibraryWork, title?: string, author?: string): boolean {
  if (!title) return !author; // nothing typed to compare with
  if (titleScore(work.title, title) >= 0.6) return true;
  return !!author && /\d/.test(title) && authorMatches(work, author);
}

/** The best candidate: the first plausible result by Open Library's own ranking, but one whose author matches what
 *  was typed wins over a better-ranked work by somebody else. Null when no result looks like the book. */
export function pickWork(works: OpenLibraryWork[], author?: string, title?: string): OpenLibraryWork | null {
  const candidates = works.filter((w) => isPlausible(w, title, author));
  if (!candidates.length) return null;
  // order: the typed author first, then a work that has a cover, then Open Library's own ranking
  const rank = (w: OpenLibraryWork) => (author && authorMatches(w, author) ? 2 : 0) + (w.coverId ? 1 : 0);
  return [...candidates].sort((a, b) => rank(b) - rank(a))[0] ?? null;
}

/**
 * Looks the book up in up to three passes and returns the results of the first pass that holds a plausible match
 * (so callers use pickWork / pickCoverId on it): 1) title + author as typed; 2) without the last word of the title,
 * which rescues a misspelt ending ("Animal firm"); 3) the author's best-known works, matched to the title tolerantly.
 * An empty list means no pass found anything that looks like the book.
 */
export async function findWorks(title: string, author?: string): Promise<OpenLibraryWork[]> {
  // a pass is "good" when it holds a plausible work with a cover (by the typed author, when one was typed);
  // a plausible work found earlier is kept as a fallback in case no later pass does better
  const isGood = (w: OpenLibraryWork | null) => !!w && !!w.coverId && (!author || authorMatches(w, author));
  let fallback: OpenLibraryWork[] = [];
  const consider = (works: OpenLibraryWork[]): OpenLibraryWork[] | null => {
    const pick = pickWork(works, author, title);
    if (isGood(pick)) return works;
    if (pick && !fallback.length) fallback = works;
    return null;
  };

  const first = consider(await searchWorks(title, author));
  if (first) return first;
  const words = title.trim().split(/\s+/);
  if (words.length >= 2) {
    const second = consider(await searchWorks(words.slice(0, -1).join(" "), author));
    if (second) return second;
  }
  if (author) {
    const matching = (await searchWorks("", author, 40)).filter((w) => titleScore(w.title, title) >= 0.6);
    const third = matching.length ? consider(matching) : null;
    if (third) return third;
  }
  return fallback;
}

/** A work's cover id: the picked work's own, else the next-best plausible work that has one. */
export function pickCoverId(works: OpenLibraryWork[], author?: string, title?: string): number | null {
  const withCover = works.filter((w) => w.coverId && isPlausible(w, title, author));
  if (!withCover.length) return null;
  const best = pickWork(works, author, title);
  if (best?.coverId) return best.coverId;
  return (author ? withCover.find((w) => authorMatches(w, author)) : undefined)?.coverId ?? withCover[0]?.coverId ?? null;
}

const NOISE_SUBJECT =
  /textbook|reader|juvenile|study guide|open library|accessible|large type|translation|nyt:|in library|reading level|protected|lending|overdrive|series|specimen|spanish|french|german|russian|english language|bestseller|best seller/i;

/** Genres worth showing, most specific first — a subject list holds plot details ("Perpetual war", "Thrushes"),
 *  translations ("Novelas inglesas") and catalogue shelf labels next to the real genres, so the real ones are
 *  recognised by keyword and reported under one clean name each. */
const GENRES: Array<[label: string, pattern: RegExp]> = [
  ["Dystopian", /dystop/i],
  ["Science fiction", /science fiction|sci fi/i],
  ["Fantasy", /fantasy/i],
  ["Mystery", /mystery|detective/i],
  ["Thriller", /thriller|suspense/i],
  ["Horror", /horror/i],
  ["Romance", /romance|love stories/i],
  ["Historical fiction", /historical fiction/i],
  ["Adventure", /adventure/i],
  ["Crime", /\bcrime\b/i],
  ["Political fiction", /political fiction/i],
  ["Satire", /satir/i],
  ["Gothic", /gothic/i],
  ["Coming of age", /coming of age/i],
  ["Classics", /classic/i],
  ["Young adult", /young adult/i],
  ["Children's", /children/i],
  ["Biography", /biograph/i],
  ["Memoir", /memoir/i],
  ["Poetry", /poetry/i],
  ["Drama", /\bdrama\b/i],
  ["Philosophy", /philosoph/i],
  ["History", /\bhistory\b/i],
  ["Humor", /humou?r|comedy/i],
  ["Fiction", /\bfiction\b/i],
];

/** Open Library subjects are a free-for-all ("Textbooks for foreign speakers", "London (england), fiction"). Maps
 *  them onto the recognisable genres above; if none apply, falls back to the first couple of short, clean subjects
 *  rather than leaving the field empty. */
export function genresFromSubjects(subjects: string[]): string[] {
  const clean: string[] = [];
  const seen = new Set<string>();
  for (const raw of subjects) {
    const subject = raw.trim().replace(/-/g, " ");
    if (!subject || subject.length > 28 || subject.split(/\s+/).length > 3) continue;
    if (/\d|--|[(),:]/.test(subject) || NOISE_SUBJECT.test(subject)) continue;
    const tag = subject.charAt(0).toLocaleUpperCase() + subject.slice(1);
    if (seen.has(tag.toLocaleLowerCase())) continue;
    seen.add(tag.toLocaleLowerCase());
    clean.push(tag);
  }
  // Comma-joined subjects are shelf labels ("Science fiction, fantasy, horror") that name every genre at once.
  const single = subjects.filter((s) => !s.includes(","));
  const known = GENRES.filter(([, pattern]) => single.some((s) => pattern.test(s))).map(([label]) => label);
  // A bare "Fiction" adds nothing next to a more specific genre.
  const specific = known.length > 1 ? known.filter((g) => g !== "Fiction") : known;
  return specific.length ? specific.slice(0, 4) : clean.slice(0, 2);
}

/** Words that mark a catalogue qualifier rather than a name: "Harry Potter (Fictitious character)". */
const CHARACTER_QUALIFIER = /\s*\((?:[^)]*\b(?:fictitious|fictional|fiction)\b[^)]*|character)\)\s*$/i;

/**
 * The main characters, from the people Open Library lists for the work (librarians catalogue these — nothing is
 * invented). Cleaned the way a reader would write them: the "(Fictitious character)" tag dropped, "Weasley, Ron"
 * turned into "Ron Weasley", dates and over-long entries (real people catalogued with years, "Napoleon I, ... 1769-1821")
 * skipped, repeats and bare first names of a name already listed ("Dumbledore" then "Albus Dumbledore") folded together.
 * Keeps the first few, which is the catalogue's own order and in practice the central cast.
 */
export function charactersFromPeople(people: string[] | undefined, max: number, maxLength: number): string[] {
  const kept: string[] = [];
  const words = (s: string) => norm(s).split(" ").filter(Boolean);
  for (const raw of people ?? []) {
    let name = raw.replace(CHARACTER_QUALIFIER, "").replace(/\s+/g, " ").trim();
    const comma = name.split(",");
    if (comma.length === 2 && comma.every((p) => /^[\p{L}.'’ -]+$/u.test(p.trim()))) name = `${comma[1]!.trim()} ${comma[0]!.trim()}`;
    if (!name || name.length > maxLength || /\d|[,;:()]/.test(name) || name.split(/\s+/).length > 4) continue;
    const mine = words(name);
    if (kept.some((k) => { const theirs = words(k); return mine.every((w) => theirs.includes(w)) || theirs.every((w) => mine.includes(w)); })) continue;
    kept.push(name);
    if (kept.length >= max) break;
  }
  return kept;
}

interface WorkResponse {
  description?: string | { value?: string };
}

/** The work's description, as plain text: markdown links flattened, and everything from the first `----` rule down
 *  (Open Library's "Contributors / Source" footers) dropped. */
export async function fetchPlot(workKey: string, maxLength: number): Promise<string | null> {
  const data = await fetchJson<WorkResponse>(`${WORK_URL}${workKey}.json`).catch(() => null);
  const raw = typeof data?.description === "string" ? data.description : data?.description?.value;
  if (!raw) return null;
  const text = (raw.replace(/\r/g, "").split(/\n-{3,}/)[0] ?? "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[\d+\]/g, "$1")
    .replace(/\(\[source\][^)]*\)/gi, "")
    .replace(/[*_`#]+/g, "")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
  if (!text) return null;

  // Keep the blurb readable: stop at a sentence end near ~1200 characters, never past the form's own limit.
  const soft = Math.min(1200, maxLength - 1);
  if (text.length <= soft) return text;
  const cut = text.slice(0, soft);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(".\n"));
  return lastStop > soft * 0.5 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`;
}
