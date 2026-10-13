import { describe, expect, it } from "vitest";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { bookSchema } from "@/shared/validation/book";

const valid = {
  title: "The Left Hand of Darkness",
  author: "Ursula K. Le Guin",
  status: "read",
  rating: 4.5,
  genres: ["Science Fiction"],
  plot: "A envoy on a wintry planet.",
  characters: ["Genly Ai", "Estraven"],
  quotes: [{ text: "The unknown is a great darkness.", page: 12 }],
  commentary: "Reread every winter.",
};

function errorsFor(input: unknown) {
  const result = bookSchema.safeParse(input);
  return result.success ? {} : fieldErrorKeys(result.error);
}

describe("book schema (Add Book)", () => {
  it("accepts a fully filled-in book", () => {
    expect(bookSchema.safeParse(valid).success).toBe(true);
  });

  it("requires Title, Author and Status", () => {
    const errors = errorsFor({ ...valid, title: "", author: "", status: undefined });
    expect(errors.title).toBe("validation.required");
    expect(errors.author).toBe("validation.required");
    expect(errors.status).toBe("validation.required");
  });

  it("accepts any script for Title and Author (no Latin restriction)", () => {
    expect(bookSchema.safeParse({ ...valid, title: "Խենթը", author: "Հովհաննես Թումանյան" }).success).toBe(true);
  });

  it("requires a Rating when Status is read", () => {
    expect(errorsFor({ ...valid, rating: null }).rating).toBe("validation.ratingRequired");
  });

  it("rejects a Rating when Status is not read — the client must never send one", () => {
    expect(errorsFor({ ...valid, status: "want_to_read", rating: 3 }).rating).toBe("validation.ratingRequired");
  });

  it("allows no Rating for every non-read status", () => {
    for (const status of ["want_to_read", "currently_reading", "did_not_finish"]) {
      expect(bookSchema.safeParse({ ...valid, status, rating: null }).success, status).toBe(true);
    }
  });

  it("only accepts half-star increments between 1 and 5", () => {
    expect(bookSchema.safeParse({ ...valid, rating: 3.5 }).success).toBe(true);
    expect(bookSchema.safeParse({ ...valid, rating: 3.25 }).success).toBe(false);
    expect(bookSchema.safeParse({ ...valid, rating: 0.5 }).success).toBe(false);
    expect(bookSchema.safeParse({ ...valid, rating: 5.5 }).success).toBe(false);
  });

  it("Genre, Plot, Characters, Quotes and Commentary are all optional", () => {
    const minimal = { title: "T", author: "A", status: "want_to_read", rating: null, genres: [], plot: "", characters: [], quotes: [], commentary: "" };
    expect(bookSchema.safeParse(minimal).success).toBe(true);
  });

  it("Genre accepts free custom tags, not just the fixed list, and de-duplicates case-insensitively", () => {
    const result = bookSchema.parse({ ...valid, genres: ["Cozy Mystery", "cozy mystery", "Fantasy"] });
    expect(result.genres).toEqual(["Cozy Mystery", "Fantasy"]);
  });

  it("Characters is a flat, de-duplicated list of names", () => {
    const result = bookSchema.parse({ ...valid, characters: ["Estraven", "estraven", "Genly Ai"] });
    expect(result.characters).toEqual(["Estraven", "Genly Ai"]);
  });

  it("Quotes: text is required per quote, page is optional", () => {
    expect(bookSchema.safeParse({ ...valid, quotes: [{ text: "" }] }).success).toBe(false);
    expect(bookSchema.safeParse({ ...valid, quotes: [{ text: "No page given" }] }).success).toBe(true);
  });

  it("rejects unknown fields", () => {
    expect(bookSchema.safeParse({ ...valid, coverUrl: "https://example.com/x.jpg" }).success).toBe(false);
  });
});
