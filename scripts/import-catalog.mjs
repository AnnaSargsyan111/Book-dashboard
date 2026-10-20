// Builds src/server/mystery/catalog-imported.ts: ~25 popular English books per Mystery Book genre, pulled from
// Open Library's search API (free, no key). Run with:  node scripts/import-catalog.mjs
//
// What Open Library supplies: title, author, cover, page count, ratings, subjects. What it does NOT supply, and so is
// *drafted here by rule* and meant to be reviewed: the 0-1 mood profile, pace, age suitability and popularity score.
// Every imported book is written with `available: true`, so the whole import is recommended and orderable. To hold a
// title back (say, it can't be supplied), set its flag to `false` in the generated file.
import { readFileSync, writeFileSync } from "node:fs";

const PER_GENRE = 25;
const UA = { "User-Agent": "MystBook/1.0 (catalog import)", Accept: "application/json" };

/** Our genre key -> an Open Library search clause. */
const GENRES = {
  fantasy: 'subject:fantasy',
  romance: 'subject:romance',
  mysteryThriller: '(subject:mystery OR subject:thriller OR subject:"detective and mystery stories" OR subject:suspense)',
  scienceFiction: 'subject:"science fiction"',
  literaryFiction: '(subject:"literary fiction" OR subject:"contemporary fiction")',
  youngAdult: 'subject:"young adult fiction"',
  selfDevelopment: '(subject:"self-help" OR subject:"personal development" OR subject:"self-improvement")',
  nonFiction: '(subject:"popular science" OR subject:"popular works" OR subject:nonfiction)',
  horror: 'subject:horror',
  historicalFiction: 'subject:"historical fiction"',
  biography: '(subject:biography OR subject:memoir OR subject:autobiography)',
  adventure: 'subject:adventure',
};

const FICTION = new Set(["fantasy", "romance", "mysteryThriller", "scienceFiction", "literaryFiction", "youngAdult", "horror", "historicalFiction", "adventure"]);

/** Genre-level starting mood scores; subject keywords below can raise them. */
const BASE_MOOD = {
  fantasy: { magical: 0.8, escapist: 0.7 },
  romance: { emotional: 0.7, lightFun: 0.5, cozy: 0.4 },
  mysteryThriller: { mysterious: 0.9, intense: 0.8 },
  scienceFiction: { escapist: 0.7, thoughtProvoking: 0.7 },
  literaryFiction: { emotional: 0.7, thoughtProvoking: 0.7 },
  youngAdult: { emotional: 0.6, lightFun: 0.5, escapist: 0.4 },
  selfDevelopment: { thoughtProvoking: 0.8, cozy: 0.3 },
  nonFiction: { thoughtProvoking: 0.8 },
  horror: { intense: 0.9, mysterious: 0.6 },
  historicalFiction: { emotional: 0.6, escapist: 0.5, thoughtProvoking: 0.4 },
  biography: { emotional: 0.5, thoughtProvoking: 0.7 },
  adventure: { escapist: 0.8, intense: 0.5, lightFun: 0.4 },
};
const MOOD_KEYWORDS = [
  ["magical", /magic|wizard|witch|fairy|myth|dragon|enchant/i, 0.9],
  ["cozy", /cozy|friendship|small town|village|food|cooking|bookstore|family life|home/i, 0.8],
  ["escapist", /adventure|travel|space|other worlds|survival|island|quest/i, 0.7],
  ["emotional", /love|grief|death|family|war|coming of age|relationship|loss|marriage|friendship/i, 0.8],
  ["intense", /murder|crime|serial|war|survival|violence|kill|assassin|dystop/i, 0.85],
  ["lightFun", /humor|humour|comedy|funny|satire|teen/i, 0.7],
  ["thoughtProvoking", /philosoph|society|dystop|psycholog|ethic|politic|human nature|science|history|self-help/i, 0.75],
  ["mysterious", /mystery|detective|secret|gothic|ghost|supernatural|spy|conspiracy|haunted/i, 0.9],
];

/** Which genre a book's own subjects point at; used to move a book whose search genre they never mention. */
const GENRE_HINTS = {
  fantasy: /fantasy|magic|dragon|wizard|fairy/i,
  romance: /romance|love stor/i,
  mysteryThriller: /mystery|thriller|detective|suspense|crime/i,
  scienceFiction: /science fiction|sci-fi|dystopia|robot|space|time travel/i,
  literaryFiction: /literary|classic|contemporary fiction/i,
  youngAdult: /young adult|teen/i,
  selfDevelopment: /self-help|self-improvement|personal development|habit|success/i,
  nonFiction: /nonfiction|science|economics|psychology|popular/i,
  horror: /horror|ghost|haunted|vampire|supernatural|monster/i,
  historicalFiction: /historical fiction|world war|holocaust|civil war|ancient/i,
  biography: /biograph|memoir|autobiograph/i,
  adventure: /adventure|survival|quest/i,
};
function bestGenre(origin, subjects) {
  const text = (subjects ?? []).join(" | ");
  if (GENRE_HINTS[origin].test(text)) return origin;
  let best = origin;
  let bestHits = 0;
  for (const [g, re] of Object.entries(GENRE_HINTS)) {
    const hits = (text.match(new RegExp(re.source, "gi")) ?? []).length;
    if (hits > bestHits && (FICTION.has(g) === FICTION.has(origin))) {
      best = g;
      bestHits = hits;
    }
  }
  return best;
}

const BAD_TITLE = /box ?set|boxed|collection|omnibus|complete (works|series|novels)|\bvolumes? \d|books? \d+-\d+|trilogy|bundle|study guide|summary of|sparknotes|cliffsnotes|workbook|coloring/i;
const BAD_SUBJECT = /comic|graphic novel|manga|textbook|study guide|juvenile literature|picture book|coloring|cookbook|readers\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30_000) });
      if (res.ok) return await res.json();
      if (res.status < 500) return null;
    } catch {
      /* retry */
    }
    await sleep(800 * (attempt + 1));
  }
  return null;
}

async function candidates(genre, clause) {
  const out = [];
  for (const sort of ["already_read", "want_to_read"]) {
    const params = new URLSearchParams({
      q: `${clause} language:eng`,
      sort,
      limit: "100",
      fields: "key,title,author_name,cover_i,number_of_pages_median,ratings_average,ratings_count,first_publish_year,subject,edition_count",
    });
    const data = await getJson(`https://openlibrary.org/search.json?${params}`);
    out.push(...(data?.docs ?? []));
    await sleep(400);
  }
  return out;
}

const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

function mood(genre, subjects) {
  const m = { ...BASE_MOOD[genre] };
  const text = subjects.join(" | ");
  for (const [key, re, score] of MOOD_KEYWORDS) if (re.test(text)) m[key] = Math.max(m[key] ?? 0, score);
  return Object.fromEntries(Object.entries(m).filter(([, v]) => v >= 0.3).map(([k, v]) => [k, Math.round(v * 10) / 10]));
}

function cleanSubjects(subjects) {
  const seen = new Set();
  const out = [];
  for (const raw of subjects ?? []) {
    const s = raw.trim();
    if (!s || s.length > 32 || s.split(/\s+/).length > 4 || /\d|--|[(),:]/.test(s)) continue;
    if (/reading level|protected|nyt|open library|accessible|large type|lending|overdrive|in library|fiction$/i.test(s) && s.length > 24) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

/** Same book, however it is spelled: case, punctuation and a leading "The"/"A" don't count. */
const titleKey = (s) => s.toLowerCase().replace(/[’']/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/^(the|a|an) /, "");

// Titles already in the hand-curated list (catalog.ts) must not be imported a second time; and no title is imported
// twice, whatever genre or edition it turned up under.
const handCurated = readFileSync(new URL("../src/server/mystery/catalog.ts", import.meta.url), "utf8");
const taken = new Set([...handCurated.matchAll(/^    title: "([^"]+)",$/gm)].map((m) => titleKey(m[1])));
const books = [];
for (const [genre, clause] of Object.entries(GENRES)) {
  const docs = await candidates(genre, clause);
  const perAuthor = new Map();
  const seenWork = new Set();
  const picked = [];
  for (const d of docs) {
    if (picked.length >= PER_GENRE) break;
    const author = d.author_name?.[0]?.trim();
    const title = d.title?.trim();
    if (!d.key || !title || !author || !d.cover_i) continue;
    if (/^[^\p{L}\p{N}]/u.test(title)) continue; // "... Trotzdem Ja zum Leben sagen" style foreign/odd titles
    if (seenWork.has(d.key)) continue;
    seenWork.add(d.key);
    const pages = d.number_of_pages_median;
    if (!pages || pages < 120 || pages > 900) continue;
    if ((d.ratings_count ?? 0) < 8) continue;
    if (BAD_TITLE.test(title) || (d.subject ?? []).some((s) => BAD_SUBJECT.test(s))) continue;
    if (/[Ͱ-‏†-￿]/.test(title + author)) continue; // Latin script only (accents and curly quotes are fine); no Cyrillic/CJK titles
    const dedupe = titleKey(title);
    if (taken.has(dedupe)) continue;
    if ((perAuthor.get(author) ?? 0) >= 2) continue;
    perAuthor.set(author, (perAuthor.get(author) ?? 0) + 1);
    taken.add(dedupe);
    picked.push(d);
  }
  const maxCount = Math.max(...picked.map((d) => d.ratings_count ?? 0), 1);
  for (const d of picked) {
    const subjects = cleanSubjects(d.subject);
    const finalGenre = bestGenre(genre, d.subject);
    const popularity = Math.round((0.45 + 0.5 * Math.min(1, Math.log10((d.ratings_count ?? 1) + 1) / Math.log10(maxCount + 1))) * 100) / 100;
    const fast = genre === "mysteryThriller" || genre === "horror" || genre === "adventure";
    books.push({
      slug: `ol-${d.key.split("/").pop().toLowerCase()}`,
      title: d.title.trim(),
      author: d.author_name[0].trim(),
      language: "en",
      genre: finalGenre,
      subgenre: subjects[0] ? titleCase(subjects[0]) : "",
      moodProfile: mood(finalGenre, subjects),
      themes: subjects.slice(0, 4).map((s) => s.toLowerCase()),
      pace: d.number_of_pages_median > 650 ? "slow" : fast || finalGenre === "mysteryThriller" || finalGenre === "horror" ? "fast" : "medium",
      pages: d.number_of_pages_median,
      popularity,
      ageSuitability: finalGenre === "youngAdult" ? "teen" : finalGenre === "horror" ? "adult" : "all",
      available: true,
      coverUrl: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
    });
  }
  console.log(`${genre.padEnd(18)} candidates ${String(docs.length).padStart(3)} -> kept ${picked.length}`);
  console.log("   " + picked.slice(0, 6).map((d) => `${d.title} (${d.author_name[0]})`).join(" | "));
}

const header = `import type { CatalogBook } from "./catalog";

/**
 * ${books.length} popular English titles imported from Open Library by \`scripts/import-catalog.mjs\` (re-run it to
 * refresh; slugs are \`ol-<Open Library work id>\`, stable). Title, author, cover, page count and the popularity score
 * come from Open Library; the mood profile, pace and age suitability are DRAFTED by rule from each book's subjects
 * and genre and should be reviewed. Every book is \`available: true\` (recommended and orderable); set a title's flag
 * to \`false\` to take it out of every recommendation.
 */
export const IMPORTED_CATALOG: CatalogBook[] = `;
writeFileSync(new URL("../src/server/mystery/catalog-imported.ts", import.meta.url), header + JSON.stringify(books, null, 2) + ";\n");
console.log(`\nwrote ${books.length} books`);
