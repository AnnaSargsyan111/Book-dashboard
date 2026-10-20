import { rmSync } from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { GET as listBooks, POST as createBook } from "@/app/api/v1/books/route";
import { POST as aiFill } from "@/app/api/v1/books/ai-fill/route";
import { PATCH as updateBook, DELETE as removeBook } from "@/app/api/v1/books/[id]/route";
import { POST as uploadCover } from "@/app/api/v1/books/[id]/cover/route";
import { POST as findCover } from "@/app/api/v1/books/[id]/cover-lookup/route";
import { getDb } from "@/server/db/client";
import { LIMITS } from "@/shared/validation/limits";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "covers");
/** A route with a dynamic [id] segment expects this as its second argument. */
const withId = (id: string) => ({ params: Promise.resolve({ id }) });

const ORIGIN = "http://localhost:3000";
const account = { firstName: "Anna", lastName: "Sargsyan", email: "anna@example.com", password: "Sunrise#2026" };
const book = {
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

function req(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "content-type": "application/json", "x-forwarded-for": "10.0.0.20", ...headers },
    body: JSON.stringify(body),
  });
}
function getReq(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, { method: "GET", headers: { host: "localhost:3000", ...headers } });
}
function deleteReq(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, { method: "DELETE", headers: { host: "localhost:3000", origin: ORIGIN, "x-forwarded-for": "10.0.0.20", ...headers } });
}
/** A multipart request: no content-type set here on purpose — the FormData body sets its own (with boundary). */
function uploadReq(path: string, formData: FormData, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "x-forwarded-for": "10.0.0.20", ...headers },
    body: formData,
  });
}
const json = async (res: Response) => (await res.json()) as any;
const cookieOf = (res: Response) => res.headers.get("set-cookie")?.split(";")[0] ?? "";

async function signedUp() {
  const res = await register(req("/api/v1/auth/register", account));
  return { cookie: cookieOf(res), user: (await json(res)).user };
}

beforeEach(async () => {
  const db = getDb();
  await db.rateLimitEvent.deleteMany();
  await db.book.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Cover uploads write real files under public/uploads/covers — clean up whatever this file created.
afterAll(() => {
  rmSync(UPLOAD_ROOT, { recursive: true, force: true });
});

describe("POST /api/v1/books", () => {
  it("requires a signed-in user", async () => {
    expect((await createBook(req("/api/v1/books", book))).status).toBe(401);
  });

  it("creates a book and persists every field", async () => {
    const { cookie, user } = await signedUp();
    const res = await createBook(req("/api/v1/books", book, { cookie }));
    expect(res.status).toBe(201);
    const { book: created } = await json(res);
    expect(created).toMatchObject({ title: book.title, author: book.author, status: "read", rating: 4.5 });
    expect(created.quotes).toEqual([{ text: "The unknown is a great darkness.", page: 12 }]);

    const row = await getDb().book.findUniqueOrThrow({ where: { id: created.id } });
    expect(row.userId).toBe(user.id);
    expect(row.genres).toEqual(["Science Fiction"]);
  });

  it("rejects a Rating unless Status is read", async () => {
    const { cookie } = await signedUp();
    const res = await createBook(req("/api/v1/books", { ...book, status: "want_to_read", rating: 4 }, { cookie }));
    expect(res.status).toBe(400);
    expect((await json(res)).error.fields.rating.message).toBe("Rating is required when Status is Read");
  });

  it("requires a Rating when Status is read", async () => {
    const { cookie } = await signedUp();
    const res = await createBook(req("/api/v1/books", { ...book, rating: null }, { cookie }));
    expect(res.status).toBe(400);
  });

  it("saves a minimal book: only Title, Author and Status", async () => {
    const { cookie } = await signedUp();
    const minimal = { title: "T", author: "A", status: "want_to_read", rating: null, genres: [], plot: "", characters: [], quotes: [], commentary: "" };
    const res = await createBook(req("/api/v1/books", minimal, { cookie }));
    expect(res.status).toBe(201);
  });

  it("rejects cross-origin requests", async () => {
    const { cookie } = await signedUp();
    const res = await createBook(req("/api/v1/books", book, { cookie, origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/books", () => {
  it("requires a signed-in user", async () => {
    expect((await listBooks(getReq("/api/v1/books"))).status).toBe(401);
  });

  it("lists only the caller's own books, newest first", async () => {
    const { cookie: cookieA } = await signedUp();
    await createBook(req("/api/v1/books", { ...book, title: "First" }, { cookie: cookieA }));
    await createBook(req("/api/v1/books", { ...book, title: "Second" }, { cookie: cookieA }));

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other@example.com" }));
    const cookieB = cookieOf(otherRes);
    await createBook(req("/api/v1/books", { ...book, title: "Someone else's" }, { cookie: cookieB }));

    const res = await listBooks(getReq("/api/v1/books", { cookie: cookieA }));
    const { books } = await json(res);
    expect(books.map((b: any) => b.title)).toEqual(["Second", "First"]);
  });
});

describe("POST /api/v1/books/ai-fill", () => {
  it("requires a signed-in user", async () => {
    expect((await aiFill(req("/api/v1/books/ai-fill", { title: "Dune" }))).status).toBe(401);
  });

  it("fills in the main characters Open Library has catalogued, cleaned up and capped", async () => {
    const { cookie } = await signedUp();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        String(url).includes("search.json")
          ? new Response(
              JSON.stringify({
                docs: [
                  {
                    key: "/works/OL2W",
                    title: "Pride and Prejudice",
                    author_name: ["Jane Austen"],
                    cover_i: 1,
                    person: ["Elizabeth Bennet (Fictitious character)", "Darcy, Fitzwilliam", "Elizabeth Bennet", "Napoleon I, Emperor of the French, 1769-1821", "Jane Bennet", "Charlotte Lucas", "George Wickham", "Mr. Bennet", "Mrs. Bennet"],
                  },
                ],
              }),
              { status: 200 },
            )
          : new Response(JSON.stringify({}), { status: 200 }),
      ),
    );
    const res = await aiFill(req("/api/v1/books/ai-fill", { title: "Pride and Prejudice" }, { cookie }));
    expect((await json(res)).characters).toEqual(["Elizabeth Bennet", "Fitzwilliam Darcy", "Jane Bennet", "Charlotte Lucas", "George Wickham", "Mr. Bennet"]);
  });

  it("fills in Author/Genres/Plot from Open Library, with Characters empty when none are catalogued", async () => {
    const { cookie } = await signedUp();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        String(url).includes("search.json")
          ? new Response(
              JSON.stringify({
                docs: [{ key: "/works/OL1W", title: "Dune", author_name: ["Frank Herbert"], cover_i: 1, subject: ["Science fiction", "Textbooks for foreign speakers", "Ecology", "Fiction, science fiction, general"] }],
              }),
              { status: 200 },
            )
          : new Response(JSON.stringify({ description: { value: "A desert planet.\r\n\r\n----------\r\nSource: somewhere" } }), { status: 200 }),
      ),
    );
    const res = await aiFill(req("/api/v1/books/ai-fill", { title: "Dune" }, { cookie }));
    expect(res.status).toBe(200);
    const result = await json(res);
    expect(result.author).toBe("Frank Herbert");
    expect(result.genres).toEqual(["Science fiction"]);
    expect(result.plot).toBe("A desert planet.");
    expect(result.characters).toEqual([]);
  });

  it("falls back to Google Books when Open Library has no record", async () => {
    const { cookie } = await signedUp();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        String(url).includes("openlibrary.org")
          ? new Response(JSON.stringify({ docs: [] }), { status: 200 })
          : new Response(
              JSON.stringify({ items: [{ volumeInfo: { authors: ["Frank Herbert"], categories: ["Fiction / Science Fiction / General"], description: "<p>A desert planet.</p>" } }] }),
              { status: 200 },
            ),
      ),
    );
    const res = await aiFill(req("/api/v1/books/ai-fill", { title: "Dune" }, { cookie }));
    expect(res.status).toBe(200);
    const result = await json(res);
    expect(result.author).toBe("Frank Herbert");
    expect(result.genres).toEqual(["Fiction", "Science Fiction", "General"]);
    expect(result.plot).toBe("A desert planet.");
  });

  it("responds AI_NO_MATCH when neither source has a record of the title", async () => {
    const { cookie } = await signedUp();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => new Response(JSON.stringify(String(url).includes("openlibrary.org") ? { docs: [] } : { items: [] }), { status: 200 })),
    );
    const res = await aiFill(req("/api/v1/books/ai-fill", { title: "Not A Real Book Title Xyz" }, { cookie }));
    expect(res.status).toBe(404);
    expect((await json(res)).error.code).toBe("AI_NO_MATCH");
  });

  it("requires a Title", async () => {
    const { cookie } = await signedUp();
    const res = await aiFill(req("/api/v1/books/ai-fill", { title: "" }, { cookie }));
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/v1/books/[id]", () => {
  it("requires a signed-in user", async () => {
    expect((await updateBook(req("/api/v1/books/x", book), withId("x"))).status).toBe(401);
  });

  it("updates every field in place", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie })));
    const changed = { ...book, title: "New Title", status: "want_to_read", rating: null };
    const res = await updateBook(req(`/api/v1/books/${created.book.id}`, changed, { cookie }), withId(created.book.id));
    expect(res.status).toBe(200);
    const { book: updated } = await json(res);
    expect(updated.title).toBe("New Title");
    expect(updated.status).toBe("want_to_read");
    expect(updated.rating).toBeNull();
  });

  it("still enforces the Rating/Status rule", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie })));
    const res = await updateBook(req(`/api/v1/books/${created.book.id}`, { ...book, status: "want_to_read", rating: 4 }, { cookie }), withId(created.book.id));
    expect(res.status).toBe(400);
  });

  it("404s for an id that doesn't exist", async () => {
    const { cookie } = await signedUp();
    const res = await updateBook(req("/api/v1/books/does-not-exist", book, { cookie }), withId("does-not-exist"));
    expect(res.status).toBe(404);
  });

  it("404s for someone else's book, and leaves it unchanged", async () => {
    const { cookie: cookieA } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie: cookieA })));

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other2@example.com" }));
    const cookieB = cookieOf(otherRes);
    const res = await updateBook(req(`/api/v1/books/${created.book.id}`, { ...book, title: "Hijacked" }, { cookie: cookieB }), withId(created.book.id));
    expect(res.status).toBe(404);

    const row = await getDb().book.findUniqueOrThrow({ where: { id: created.book.id } });
    expect(row.title).toBe(book.title);
  });
});

describe("DELETE /api/v1/books/[id]", () => {
  it("requires a signed-in user", async () => {
    expect((await removeBook(deleteReq("/api/v1/books/x"), withId("x"))).status).toBe(401);
  });

  it("deletes the caller's own book", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie })));
    const res = await removeBook(deleteReq(`/api/v1/books/${created.book.id}`, { cookie }), withId(created.book.id));
    expect(res.status).toBe(204);
    expect(await getDb().book.findUnique({ where: { id: created.book.id } })).toBeNull();
  });

  it("404s for someone else's book, and leaves it in place", async () => {
    const { cookie: cookieA } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie: cookieA })));

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other3@example.com" }));
    const cookieB = cookieOf(otherRes);
    const res = await removeBook(deleteReq(`/api/v1/books/${created.book.id}`, { cookie: cookieB }), withId(created.book.id));
    expect(res.status).toBe(404);
    expect(await getDb().book.findUnique({ where: { id: created.book.id } })).not.toBeNull();
  });
});

describe("POST /api/v1/books/[id]/cover", () => {
  it("requires a signed-in user", async () => {
    const form = new FormData();
    form.set("file", new File([Buffer.from("x")], "cover.jpg", { type: "image/jpeg" }));
    expect((await uploadCover(uploadReq("/api/v1/books/x/cover", form), withId("x"))).status).toBe(401);
  });

  it("saves the file to disk and sets coverUrl", async () => {
    const { cookie, user } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie })));
    const form = new FormData();
    form.set("file", new File([Buffer.from("fake-image-bytes")], "cover.jpg", { type: "image/jpeg" }));
    const res = await uploadCover(uploadReq(`/api/v1/books/${created.book.id}/cover`, form, { cookie }), withId(created.book.id));
    expect(res.status).toBe(200);
    const { book: updated } = await json(res);
    expect(updated.coverUrl).toBe(`/uploads/covers/${user.id}/${created.book.id}.jpg`);
  });

  it("rejects a file that isn't an accepted image type", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie })));
    const form = new FormData();
    form.set("file", new File([Buffer.from("not an image")], "notes.txt", { type: "text/plain" }));
    const res = await uploadCover(uploadReq(`/api/v1/books/${created.book.id}/cover`, form, { cookie }), withId(created.book.id));
    expect(res.status).toBe(415);
    expect((await json(res)).error.code).toBe("COVER_INVALID_TYPE");
  });

  it("rejects a file over the size cap", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie })));
    const form = new FormData();
    form.set("file", new File([Buffer.alloc(LIMITS.bookCoverMaxBytes + 1)], "big.jpg", { type: "image/jpeg" }));
    const res = await uploadCover(uploadReq(`/api/v1/books/${created.book.id}/cover`, form, { cookie }), withId(created.book.id));
    expect(res.status).toBe(413);
    expect((await json(res)).error.code).toBe("COVER_TOO_LARGE");
  });

  it("404s for someone else's book", async () => {
    const { cookie: cookieA } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie: cookieA })));
    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other4@example.com" }));
    const cookieB = cookieOf(otherRes);
    const form = new FormData();
    form.set("file", new File([Buffer.from("x")], "cover.jpg", { type: "image/jpeg" }));
    const res = await uploadCover(uploadReq(`/api/v1/books/${created.book.id}/cover`, form, { cookie: cookieB }), withId(created.book.id));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/books/[id]/cover-lookup", () => {
  it("requires a signed-in user", async () => {
    expect((await findCover(req("/api/v1/books/x/cover-lookup", {}), withId("x"))).status).toBe(401);
  });

  it("sets the cover when Open Library returns a match", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie })));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ docs: [{ key: "/works/OL1W", title: "The Left Hand of Darkness", author_name: ["Ursula K. Le Guin"], cover_i: 12345 }] }), { status: 200 })));
    const res = await findCover(req(`/api/v1/books/${created.book.id}/cover-lookup`, {}, { cookie }), withId(created.book.id));
    expect(res.status).toBe(200);
    const { book: updated } = await json(res);
    expect(updated.coverUrl).toBe("https://covers.openlibrary.org/b/id/12345-L.jpg");
  });

  it("never takes the cover of an unrelated book (a misspelt title makes Open Library answer with something else)", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie })));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ docs: [{ key: "/works/OL9W", title: "Dracula's guest, and other weird stories", author_name: ["Bram Stoker"], cover_i: 8369722 }] }), { status: 200 })));
    const res = await findCover(req(`/api/v1/books/${created.book.id}/cover-lookup`, {}, { cookie }), withId(created.book.id));
    expect(res.status).toBe(404);
    expect((await json(res)).error.code).toBe("COVER_NOT_FOUND");
  });

  it("responds COVER_NOT_FOUND when nothing matches", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie })));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ docs: [] }), { status: 200 })));
    const res = await findCover(req(`/api/v1/books/${created.book.id}/cover-lookup`, {}, { cookie }), withId(created.book.id));
    expect(res.status).toBe(404);
    expect((await json(res)).error.code).toBe("COVER_NOT_FOUND");
  });

  it("404s for someone else's book", async () => {
    const { cookie: cookieA } = await signedUp();
    const created = await json(await createBook(req("/api/v1/books", book, { cookie: cookieA })));
    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other5@example.com" }));
    const cookieB = cookieOf(otherRes);
    const res = await findCover(req(`/api/v1/books/${created.book.id}/cover-lookup`, {}, { cookie: cookieB }), withId(created.book.id));
    expect(res.status).toBe(404);
  });
});
