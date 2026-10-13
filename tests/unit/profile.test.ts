import { describe, expect, it } from "vitest";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { GENRE_KEYS } from "@/shared/genres";
import { profileUpdateSchema } from "@/shared/validation/profile";

const valid = { genres: ["fantasy", "poetry"], favoriteAuthors: ["Ursula K. Le Guin"], aboutMe: "I read slowly and underline a lot." };

function errorsFor(input: unknown) {
  const result = profileUpdateSchema.safeParse(input);
  return result.success ? {} : fieldErrorKeys(result.error);
}

describe("profile update schema (the About Me page)", () => {
  it("accepts a full answer", () => {
    expect(profileUpdateSchema.safeParse(valid).success).toBe(true);
  });

  it("unlike onboarding, an empty About Me is valid — this is a profile, not a second onboarding", () => {
    const result = profileUpdateSchema.safeParse({ genres: [], favoriteAuthors: [], aboutMe: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.aboutMe).toBe("");
  });

  it("all three fields can be cleared to empty at once", () => {
    expect(profileUpdateSchema.safeParse({ genres: [], favoriteAuthors: [], aboutMe: "" }).success).toBe(true);
  });

  it("still enforces the 5-genre limit", () => {
    const six = GENRE_KEYS.slice(0, 6);
    expect(errorsFor({ ...valid, genres: six }).genres).toBe("validation.maxGenres");
    expect(profileUpdateSchema.safeParse({ ...valid, genres: GENRE_KEYS.slice(0, 5) }).success).toBe(true);
  });

  it("still rejects genres outside the catalog", () => {
    expect(profileUpdateSchema.safeParse({ ...valid, genres: ["not-a-genre"] }).success).toBe(false);
  });

  it("still normalizes and de-duplicates authors, any script", () => {
    const result = profileUpdateSchema.parse({
      genres: [],
      favoriteAuthors: ["  Ursula   K. Le Guin ", "ursula k. le guin", "Достоевский", "村上春樹"],
      aboutMe: "",
    });
    expect(result.favoriteAuthors).toEqual(["Ursula K. Le Guin", "Достоевский", "村上春樹"]);
  });

  it("still limits About Me to 1500 characters and normalizes line endings", () => {
    expect(errorsFor({ ...valid, aboutMe: "a".repeat(1501) }).aboutMe).toBe("validation.aboutTooLong");
    const result = profileUpdateSchema.parse({ ...valid, aboutMe: "line one\r\nline two" });
    expect(result.aboutMe).toBe("line one\nline two");
  });

  it("rejects unknown fields (names and email cannot be changed here)", () => {
    expect(profileUpdateSchema.safeParse({ ...valid, firstName: "Mallory" }).success).toBe(false);
  });
});
