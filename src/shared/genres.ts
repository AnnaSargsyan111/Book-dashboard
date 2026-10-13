/**
 * The genre catalog. Genres are stored as these stable KEYS; display names live in the message catalogs under
 * `genres.<key>`, so adding a language never touches stored data. The Mystery Book engine reads the same keys.
 */
export const GENRE_KEYS = [
  "fiction",
  "literaryFiction",
  "classics",
  "mystery",
  "thriller",
  "crime",
  "fantasy",
  "scienceFiction",
  "romance",
  "historicalFiction",
  "horror",
  "adventure",
  "youngAdult",
  "poetry",
  "nonFiction",
  "biography",
  "history",
  "philosophy",
  "psychology",
  "selfDevelopment",
  "shortStories",
  "graphicNovel",
] as const;

export type GenreKey = (typeof GENRE_KEYS)[number];
