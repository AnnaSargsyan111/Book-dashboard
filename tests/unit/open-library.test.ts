import { describe, expect, it, vi } from "vitest";
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

describe("findWorks: the lookup is tolerant of a misspelt title", () => {
  const reply = (docs: object[]) => new Response(JSON.stringify({ docs }), { status: 200 });
  const doc = (title: string, author: string, cover: number) => ({ key: `/works/${title}`, title, author_name: [author], cover_i: cover });

  it("tries the title as typed, then without its last word, then the author's works", async () => {
    const queries: string[] = [];
    // 1) as typed: only an unrelated book; 2) without the last word: nothing; 3) the author's works: the right one
    const answers = [[doc("Dracula's guest", "Bram Stoker", 1)], [], [doc("Nineteen Eighty-Four", "George Orwell", 2), doc("Animal Farm", "George Orwell", 3)]];
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      queries.push(new URL(url).searchParams.get("q") ?? "");
      return reply(answers[queries.length - 1] ?? []);
    }));
    const { findWorks, pickCoverId } = await import("@/server/ai/open-library");
    const works = await findWorks("Animal firm", "George Orwell");
    expect(queries).toEqual(["Animal firm George Orwell", "Animal George Orwell", "George Orwell"]);
    expect(pickCoverId(works, "George Orwell", "Animal firm")).toBe(3);
    vi.unstubAllGlobals();
  });

  it("finds the book when the author's name has a typo (the search needs every typed word, so it retries on the title alone)", async () => {
    const queries: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      const q = new URL(url).searchParams.get("q") ?? "";
      queries.push(q);
      // Open Library finds nothing for a word it has never seen ("Roney"), and the book as soon as only the title is asked
      return reply(q.includes("Roney") ? [] : [doc("Normal People", "Sally Rooney", 7)]);
    }));
    const { findWorks, pickWork } = await import("@/server/ai/open-library");
    const works = await findWorks("Normal People", "Sally Roney");
    expect(queries.at(-1)).toBe("Normal People");
    expect(pickWork(works, "Sally Roney", "Normal People")?.title).toBe("Normal People");

    // a different writer is still "not found", never somebody else's book with the same title
    vi.stubGlobal("fetch", vi.fn(async (url: string) => reply(new URL(url).searchParams.get("q")?.includes("King") ? [] : [doc("Dune", "Frank Herbert", 9)])));
    expect(await findWorks("Dune", "Stephen King")).toEqual([]);
    vi.unstubAllGlobals();
  });

  it("stops at the first pass that has a plausible match, and gives up with an empty list", async () => {
    const calls = vi.fn(async () => reply([doc("Animal Farm", "George Orwell", 3)]));
    vi.stubGlobal("fetch", calls);
    const { findWorks } = await import("@/server/ai/open-library");
    expect((await findWorks("Animal Farm", "George Orwell")).length).toBe(1);
    expect(calls).toHaveBeenCalledTimes(1);
    vi.stubGlobal("fetch", vi.fn(async () => reply([doc("Dracula's guest", "Bram Stoker", 1)])));
    expect(await findWorks("Zzqxv thing", "Nobody Atall")).toEqual([]);
    vi.unstubAllGlobals();
  });
});

describe("regressions that must never come back", () => {
  it("the author alone never rescues a title that matches nothing ('Animal firm' by Bram Stoker is not Dracula's Guest)", () => {
    expect(isPlausible(DRACULA, "Animal firm", "Bram Stoker")).toBe(false);
    expect(pickCoverId([DRACULA], "Bram Stoker", "Animal firm")).toBeNull();
    expect(pickWork([DRACULA], "Bram Stoker", "Animal firm")).toBeNull();
  });

  it("a title with a number may be known by its words, so there the author is enough ('1984')", () => {
    expect(isPlausible(NINETEEN, "1984", "George Orwell")).toBe(true);
    expect(isPlausible(NINETEEN, "1984", "Bram Stoker")).toBe(false);
  });

  it("accents do not matter in names or titles (Saint-Exupéry, Brontë)", () => {
    expect(pickWork([work("The Little Prince", ["Antoine de Saint-Exupéry"])], "Antoine de Saint-Exupery", "The Little Prince")).not.toBeNull();
    expect(pickWork([work("Jane Eyre", ["Charlotte Brontë"])], "charlotte bronte", "Jane Eyre")).not.toBeNull();
  });

  it("among plausible works, the typed author and a cover win over Open Library's order", () => {
    const sis = work("The pilot and the little prince", ["Peter Sís"], 11695223);
    const prince = work("The Little Prince", ["Antoine de Saint-Exupéry"], 42);
    expect(pickCoverId([sis, prince], "Antoine de Saint-Exupery", "The Little Prince")).toBe(42);
    const noCover = work("Crime and Punishmant", ["Достоевский"], null);
    const real = work("Crime and Punishment", ["Fyodor Dostoevsky"], 15183762);
    expect(pickWork([noCover, real], "Fyodor Dostoevsky", "Crime and Punishment")).toBe(real);
  });
});
