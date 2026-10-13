import type { GenreKey } from "@/shared/genres";
import type { BookRecord } from "@/server/modules/books/book.repository";
import type { UserProfileData } from "@/server/modules/profile/profile.repository";
import type { ExperienceKey, MoodKey, MysteryGenreKey, MysteryRecommendInput } from "@/shared/validation/mystery";
import { CATALOG, type CatalogBook } from "./catalog";

/** Maps a user's own 22-key library genre list onto the catalog's 12-key list, so the engine still has a genre
 *  signal (Section 9's "Genre Preference" input) when Step 2 was skipped by the cold-start check. */
const GENRE_MAP: Partial<Record<GenreKey, MysteryGenreKey>> = {
  fiction: "literaryFiction",
  literaryFiction: "literaryFiction",
  classics: "literaryFiction",
  mystery: "mysteryThriller",
  thriller: "mysteryThriller",
  crime: "mysteryThriller",
  fantasy: "fantasy",
  scienceFiction: "scienceFiction",
  romance: "romance",
  historicalFiction: "historicalFiction",
  horror: "horror",
  adventure: "adventure",
  youngAdult: "youngAdult",
  poetry: "literaryFiction",
  nonFiction: "nonFiction",
  biography: "biography",
  history: "nonFiction",
  philosophy: "nonFiction",
  psychology: "selfDevelopment",
  selfDevelopment: "selfDevelopment",
  shortStories: "literaryFiction",
  graphicNovel: "literaryFiction",
};

/** A user's own books only carry free-text genre tags, never one of the catalog's stable keys — this is the
 *  approximate bridge for Section 10's "reading history / taste" signal (15%). */
const GENRE_KEYWORDS: Record<MysteryGenreKey, string[]> = {
  fantasy: ["fantasy", "magic"],
  romance: ["romance", "love"],
  mysteryThriller: ["mystery", "thriller", "crime", "detective", "suspense"],
  scienceFiction: ["science fiction", "sci-fi", "scifi"],
  literaryFiction: ["literary", "fiction", "classic"],
  historicalFiction: ["historical"],
  horror: ["horror", "gothic"],
  adventure: ["adventure"],
  biography: ["biography", "memoir"],
  selfDevelopment: ["self-development", "self development", "growth", "psychology"],
  youngAdult: ["young adult", "ya"],
  nonFiction: ["non-fiction", "nonfiction", "history", "philosophy"],
};

export interface MysteryContext {
  profile: UserProfileData;
  books: BookRecord[];
  /** Slugs of books already recommended to this user in a previous session (Section 11). */
  previousSlugs: Set<string>;
}

/**
 * Section 3's Cold-Start Principle: skip Step 2 (Genre) once the system already knows enough — an onboarding
 * genre pick, or a handful of rated "read" books, either counts as "enough."
 */
export function needsGenreStep(profile: UserProfileData, books: BookRecord[]): boolean {
  if (profile.genres.length > 0) return false;
  const ratedReads = books.filter((b) => b.status === "read" && b.rating != null).length;
  return ratedReads < 3;
}

function moodMatchScore(book: CatalogBook, moods: MoodKey[]): number {
  if (moods.length === 0) return 0;
  const sum = moods.reduce((total, m) => total + (book.moodProfile[m] ?? 0), 0);
  return sum / moods.length;
}

/** 1 if the book's genre is among the ones the user actually picked this session; falling back to their
 *  profile's own genres (mapped) when Step 2 was skipped; neutral (not penalized) when neither exists. */
function genreMatchScore(book: CatalogBook, selectedGenres: MysteryGenreKey[] | undefined, profileGenres: GenreKey[]): number {
  if (selectedGenres && selectedGenres.length > 0) return selectedGenres.includes(book.genre) ? 1 : 0;
  const mapped = new Set(profileGenres.map((g) => GENRE_MAP[g]).filter((g): g is MysteryGenreKey => !!g));
  if (mapped.size === 0) return 0.5;
  return mapped.has(book.genre) ? 1 : 0;
}

function historyTasteScore(book: CatalogBook, books: BookRecord[]): number {
  const readGenres = books
    .filter((b) => b.status === "read")
    .flatMap((b) => b.genres.map((g) => g.toLowerCase()));
  if (readGenres.length === 0) return 0;
  const keywords = GENRE_KEYWORDS[book.genre];
  const matches = readGenres.filter((g) => keywords.some((k) => g.includes(k))).length;
  return Math.min(1, matches / 3);
}

function authorMatchScore(book: CatalogBook, favoriteAuthors: string[]): number {
  return favoriteAuthors.some((a) => a.trim().toLowerCase() === book.author.toLowerCase()) ? 1 : 0;
}

/** The weighted model from Section 10. "Desired Experience" isn't in that 100%-summed table, so it steers the
 *  reasoning copy (below) rather than the score — folding it in here would double-count past what was specified. */
function scoreBook(book: CatalogBook, input: MysteryRecommendInput, context: MysteryContext): number {
  const mood = moodMatchScore(book, input.moods as MoodKey[]);
  const genre = genreMatchScore(book, input.genres as MysteryGenreKey[] | undefined, context.profile.genres);
  const history = historyTasteScore(book, context.books);
  const author = authorMatchScore(book, context.profile.favoriteAuthors);
  return 0.4 * mood + 0.25 * genre + 0.15 * history + 0.1 * author + 0.1 * book.popularity;
}

/** Section 11's hard filters. "Already read" matches by title+author since the catalog has no ISBN to key on.
 *  Exported so the commit route (see mystery/recommend/commit) can re-validate a client-supplied slug without
 *  re-running the ranking — it must persist the exact candidate the user is looking at, not a re-scored one. */
export function isEligible(book: CatalogBook, context: MysteryContext): boolean {
  if (!book.available) return false;
  if (context.previousSlugs.has(book.slug)) return false;
  const alreadyInLibrary = context.books.some((b) => b.title.trim().toLowerCase() === book.title.toLowerCase() && b.author.trim().toLowerCase() === book.author.toLowerCase());
  return !alreadyInLibrary;
}

/** A book at or above this average mood score reads as a genuinely strong match — not just "technically
 *  nonzero" — for whichever mood(s) the user picked (Section 10's own mood scale is 0–1 per mood). */
const HIGH_MOOD_MATCH = 0.5;

/** Filtering -> Ranking -> one book (Section 9's pipeline). Returns `null` when nothing survives Section 11's
 *  filters — genuinely, not papered over. Silently substituting an unrelated book to avoid an empty state is
 *  explicitly the thing not to do; the caller shows a real "no match" state instead (Section 13.11).
 *
 * Mood is the heaviest-weighted signal (40%), but it's still just one term in a blended score — a book with a
 * strong genre/popularity showing can outscore one that actually matches the mood picked, if that mood happens
 * to be only weakly present (or entirely absent) in its `moodProfile` (the catalog's mood tagging is sparse: 2–4
 * moods per book, not all 8). Left unchecked, that surfaces a "95% mood match"-style result reading low or
 * literally 0%, which looks broken even though the math is doing what it says — and a book someone picked a
 * mood for should actually feel like that mood, not just edge out the competition on genre and popularity. So
 * ranking narrows the pool in two steps before ever falling back to "best overall": first to books with a
 * *strong* mood match (`>= HIGH_MOOD_MATCH`), then — only if none clear that bar — to books with *any* mood
 * relevance at all, and only once neither of those has a single candidate does it rank the full eligible pool.
 * Each step down is a real degradation (the catalog is genuinely thin for that mood once previously-recommended
 * titles are excluded), never silently hidden — but the best remaining answer still beats a hard "no match". */
export function pickBook(input: MysteryRecommendInput, context: MysteryContext): CatalogBook | null {
  const eligible = CATALOG.filter((b) => isEligible(b, context));
  if (eligible.length === 0) return null;

  const moods = input.moods as MoodKey[];
  const strongMatch = moods.length > 0 ? eligible.filter((b) => moodMatchScore(b, moods) >= HIGH_MOOD_MATCH) : [];
  const anyMatch = moods.length > 0 ? eligible.filter((b) => moodMatchScore(b, moods) > 0) : [];
  const pool = strongMatch.length > 0 ? strongMatch : anyMatch.length > 0 ? anyMatch : eligible;

  let best: CatalogBook | null = null;
  let bestScore = -1;
  for (const book of pool) {
    const score = scoreBook(book, input, context);
    if (score > bestScore) {
      bestScore = score;
      best = book;
    }
  }
  return best;
}

const MOOD_PHRASE: Record<"en" | "hy", Record<MoodKey, string>> = {
  en: {
    magical: "immersive, wonder-filled stories",
    cozy: "something warm and comforting",
    escapist: "something that helps you escape",
    emotional: "emotionally rich stories",
    intense: "something gripping and intense",
    lightFun: "something light and fun",
    thoughtProvoking: "stories that make you think",
    mysterious: "something full of mystery",
  },
  hy: {
    magical: "ընկղմող, հրաշքով լի պատմություններ",
    cozy: "ինչ-որ բան՝ տաք ու հարմարավետ",
    escapist: "մի բան, որը կօգնի Ձեզ փախչել իրականությունից",
    emotional: "հուզականորեն հարուստ պատմություններ",
    intense: "մի բան՝ գրավիչ ու ինտենսիվ",
    lightFun: "ինչ-որ բան՝ թեթև ու զվարճալի",
    thoughtProvoking: "պատմություններ, որոնք մտածելու տեղիք են տալիս",
    mysterious: "մի բան, որը լի է խորհրդավորությամբ",
  },
};

const EXPERIENCE_PHRASE: Record<"en" | "hy", Record<ExperienceKey, string>> = {
  en: {
    escapeMe: "to be taken somewhere else",
    makeMeFeel: "an emotional experience",
    keepMeHooked: "something you won't want to put down",
    makeMeThink: "something that challenges your perspective",
    makeMeSmile: "something light and enjoyable",
    surpriseMe: "something unexpected",
  },
  hy: {
    escapeMe: "տեղափոխվել մեկ այլ աշխարհ",
    makeMeFeel: "հուզական փորձառություն",
    keepMeHooked: "մի բան, որը ձեռքից բաց չեք թողնի",
    makeMeThink: "մի բան, որը կմարտահրավերի Ձեր հայացքները",
    makeMeSmile: "ինչ-որ բան՝ թեթև ու հաճելի",
    surpriseMe: "ինչ-որ անսպասելի բան",
  },
};

/** Builds the "why this book" copy from the session's own answers (Section 12/13: "dynamically generated, not
 *  static copy") — never from the book itself, so it never leaks an identifying detail in Keep It a Mystery mode. */
export function buildReasoning(locale: "en" | "hy", input: MysteryRecommendInput): string {
  const moods = input.moods as MoodKey[];
  const mood = MOOD_PHRASE[locale];
  const experience = EXPERIENCE_PHRASE[locale];

  const primary = mood[moods[0]!];
  const secondary = input.experience ? experience[input.experience as ExperienceKey] : moods[1] ? mood[moods[1]] : null;

  if (locale === "hy") {
    return secondary ? `Դուք սիրում եք ${primary}, և փնտրում եք ${secondary}։` : `Դուք սիրում եք ${primary}։`;
  }
  return secondary ? `You enjoy ${primary}, and you're looking for ${secondary}.` : `You enjoy ${primary}.`;
}
