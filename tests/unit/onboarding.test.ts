import { describe, expect, it } from "vitest";
import { catalogs } from "@/i18n/messages";
import { GENRE_KEYS } from "@/shared/genres";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { onboardingSchema } from "@/shared/validation/onboarding";

const valid = { genres: ["fantasy", "poetry"], favoriteAuthors: ["Ursula K. Le Guin"], aboutMe: "I read slowly and underline a lot." };

function errorsFor(input: unknown) {
  const result = onboardingSchema.safeParse(input);
  return result.success ? {} : fieldErrorKeys(result.error);
}

describe("onboarding schema", () => {
  it("accepts a full answer", () => {
    expect(onboardingSchema.safeParse(valid).success).toBe(true);
  });

  it("only About Me is required: empty genres and authors are fine", () => {
    const result = onboardingSchema.safeParse({ genres: [], favoriteAuthors: [], aboutMe: "Hello" });
    expect(result.success).toBe(true);
  });

  it("empty or whitespace-only About Me is rejected with the required key", () => {
    expect(errorsFor({ ...valid, aboutMe: "" }).aboutMe).toBe("validation.required");
    expect(errorsFor({ ...valid, aboutMe: "   \n  " }).aboutMe).toBe("validation.required");
  });

  it("allows at most 5 genres", () => {
    const six = GENRE_KEYS.slice(0, 6);
    expect(errorsFor({ ...valid, genres: six }).genres).toBe("validation.maxGenres");
    expect(onboardingSchema.safeParse({ ...valid, genres: GENRE_KEYS.slice(0, 5) }).success).toBe(true);
  });

  it("rejects genres that are not in the catalog", () => {
    expect(onboardingSchema.safeParse({ ...valid, genres: ["not-a-genre"] }).success).toBe(false);
  });

  it("accepts author names and About Me in any script", () => {
    const result = onboardingSchema.safeParse({
      genres: [],
      favoriteAuthors: ["Ուիլյամ Սարոյան", "Достоевский", "村上春樹", "غسان كنفاني"],
      aboutMe: "Ես սիրում եմ կարդալ։ 読書が好きです。",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes authors: trims, collapses spaces, drops case-insensitive duplicates, keeps order", () => {
    const result = onboardingSchema.parse({ ...valid, favoriteAuthors: ["  Ursula   K. Le Guin ", "ursula k. le guin", "Borges"] });
    expect(result.favoriteAuthors).toEqual(["Ursula K. Le Guin", "Borges"]);
  });

  it("limits authors: at most 20, each at most 80 characters", () => {
    expect(errorsFor({ ...valid, favoriteAuthors: Array.from({ length: 21 }, (_, i) => `Author ${i}`) }).favoriteAuthors).toBe("validation.tooManyAuthors");
    expect(errorsFor({ ...valid, favoriteAuthors: ["x".repeat(81)] }).favoriteAuthors).toBe("validation.authorTooLong");
    expect(onboardingSchema.safeParse({ ...valid, favoriteAuthors: ["x".repeat(80)] }).success).toBe(true);
  });

  it("limits About Me to 1500 characters and keeps line breaks", () => {
    expect(errorsFor({ ...valid, aboutMe: "a".repeat(1501) }).aboutMe).toBe("validation.aboutTooLong");
    const result = onboardingSchema.parse({ ...valid, aboutMe: "line one\r\nline two" });
    expect(result.aboutMe).toBe("line one\nline two");
  });

  it("rejects unknown fields (names cannot be changed here)", () => {
    expect(onboardingSchema.safeParse({ ...valid, firstName: "Mallory" }).success).toBe(false);
  });
});

describe("genre catalog", () => {
  it("has 22 genres, each named in both languages", () => {
    expect(GENRE_KEYS).toHaveLength(22);
    for (const key of GENRE_KEYS) {
      expect(catalogs.en.genres[key], `en ${key}`).toBeTruthy();
      expect(catalogs.hy.genres[key], `hy ${key}`).toBeTruthy();
    }
  });

  it("uses the specified wording for the genre limit message", () => {
    expect(catalogs.en.validation.maxGenres).toBe("You can select up to {genresMax} genres");
    expect(catalogs.hy.validation.maxGenres).toBe("Թույլատրվում է ընտրել առավելագույնը {genresMax} ժանր");
  });
});
