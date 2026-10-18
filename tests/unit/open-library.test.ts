import { describe, expect, it } from "vitest";
import { isPlausible, pickCoverId, pickWork, titleScore, type OpenLibraryWork } from "@/server/ai/open-library";

const work = (title: string, authors: string[], coverId: number | null = 1): OpenLibraryWork => ({ key: `/works/${title}`, title, authors, coverId, subjects: [] });

const DRACULA = work("Dracula's guest, and other weird stories", ["Bram Stoker", "Washington Irving"], 8369722);
const COMMITTEE = work("The Story of The Committee of 300", ["John Coleman"], 6426475);
const FARM = work("Animal Farm", ["George Orwell"], 11261770);
const NINETEEN = work("Nineteen Eighty-Four", ["George Orwell"], 9267242);

describe("a cover or a book is only taken when it really looks like the book that was typed", () => {
  it("never uses somebody else's cover (a misspelt title made Open Library answer with Dracula's Guest)", () => {
    const works = [DRACULA, COMMITTEE];
    expect(pickCoverId(works, "George Orwell", "Animal firm")).toBeNull();
    expect(pickWork(works, "George Orwell", "Animal firm")).toBeNull();
    expect(pickCoverId(works, undefined, "Animal firm")).toBeNull();
  });

  it("forgives a one-letter typo in the title", () => {
    expect(titleScore("Animal Farm", "Animal firm")).toBe(1);
    expect(titleScore("Animal Farm", "Animal xyzzy")).toBe(0.5); // only "Animal" matches: not enough on its own
    expect(pickCoverId([DRACULA, FARM], "George Orwell", "Animal firm")).toBe(11261770);
  });

  it("still finds a well-known book typed in another form when the author matches ('1984' -> Nineteen Eighty-Four)", () => {
    expect(pickCoverId([NINETEEN, FARM], "George Orwell", "1984")).toBe(9267242);
    expect(pickWork([DRACULA, NINETEEN], "orwell", "1984")).toBe(NINETEEN);
  });

  it("with no author typed, the title itself must match", () => {
    expect(pickCoverId([DRACULA, FARM], undefined, "Animal Farm")).toBe(11261770);
    expect(isPlausible(DRACULA, "Animal Farm", undefined)).toBe(false);
    expect(titleScore("The Hobbit", "the hobbit")).toBe(1);
    expect(titleScore("Dune Messiah", "Dune")).toBe(1); // a partial title is fine
  });

  it("prefers a plausible work by the typed author, and skips plausible ones with no cover", () => {
    expect(pickWork([work("Animal Farm", ["J. A. Griffin"]), FARM], "George Orwell", "Animal Farm")).toBe(FARM);
    expect(pickCoverId([work("Animal Farm", ["George Orwell"], null), work("Animal Farm / Nineteen Eighty-Four", ["George Orwell"], 10524365)], "George Orwell", "Animal Farm")).toBe(10524365);
  });
});
