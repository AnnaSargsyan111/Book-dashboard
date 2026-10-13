import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as createBook } from "@/app/api/v1/books/route";
import { GET as listThoughts, POST as createThought } from "@/app/api/v1/thoughts/route";
import { PATCH as updateThought, DELETE as removeThought } from "@/app/api/v1/thoughts/[id]/route";
import { getDb } from "@/server/db/client";

/** A route with a dynamic [id] segment expects this as its second argument. */
const withId = (id: string) => ({ params: Promise.resolve({ id }) });

const ORIGIN = "http://localhost:3000";
const account = { firstName: "Anna", lastName: "Sargsyan", email: "anna@example.com", password: "Sunrise#2026" };
const book = {
  title: "The Alchemist",
  author: "Paulo Coelho",
  status: "want_to_read",
  rating: null,
  genres: [],
  plot: "",
  characters: [],
  quotes: [],
  commentary: "",
};
const thought = { title: "A realization", text: "The paved road isn't the only road.", bookId: null, favorite: false };

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
const json = async (res: Response) => (await res.json()) as any;
const cookieOf = (res: Response) => res.headers.get("set-cookie")?.split(";")[0] ?? "";

async function signedUp() {
  const res = await register(req("/api/v1/auth/register", account));
  return { cookie: cookieOf(res), user: (await json(res)).user };
}

beforeEach(async () => {
  const db = getDb();
  await db.rateLimitEvent.deleteMany();
  await db.thought.deleteMany();
  await db.book.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/v1/thoughts", () => {
  it("requires a signed-in user", async () => {
    expect((await createThought(req("/api/v1/thoughts", thought))).status).toBe(401);
  });

  it("captures a thought with no title and no book", async () => {
    const { cookie, user } = await signedUp();
    const res = await createThought(req("/api/v1/thoughts", { ...thought, title: "" }, { cookie }));
    expect(res.status).toBe(201);
    const { thought: created } = await json(res);
    expect(created).toMatchObject({ title: null, text: thought.text, favorite: false, book: null });

    const row = await getDb().thought.findUniqueOrThrow({ where: { id: created.id } });
    expect(row.userId).toBe(user.id);
  });

  it("requires non-empty text", async () => {
    const { cookie } = await signedUp();
    const res = await createThought(req("/api/v1/thoughts", { ...thought, text: "" }, { cookie }));
    expect(res.status).toBe(400);
  });

  it("links a real book of the caller's own and returns it embedded", async () => {
    const { cookie } = await signedUp();
    const { book: created } = await json(await createBook(req("/api/v1/books", book, { cookie })));
    const res = await createThought(req("/api/v1/thoughts", { ...thought, bookId: created.id }, { cookie }));
    expect(res.status).toBe(201);
    const { thought: savedThought } = await json(res);
    expect(savedThought.book).toMatchObject({ id: created.id, title: book.title, author: book.author });
  });

  it("silently drops a bookId that isn't the caller's own book, rather than linking it", async () => {
    const { cookie: cookieA } = await signedUp();
    const { book: otherBook } = await json(await createBook(req("/api/v1/books", book, { cookie: cookieA })));

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other2@example.com" }));
    const cookieB = cookieOf(otherRes);
    const res = await createThought(req("/api/v1/thoughts", { ...thought, bookId: otherBook.id }, { cookie: cookieB }));
    expect(res.status).toBe(201);
    const { thought: savedThought } = await json(res);
    expect(savedThought.book).toBeNull();
  });

  it("rejects cross-origin requests", async () => {
    const { cookie } = await signedUp();
    const res = await createThought(req("/api/v1/thoughts", thought, { cookie, origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/thoughts", () => {
  it("requires a signed-in user", async () => {
    expect((await listThoughts(getReq("/api/v1/thoughts"))).status).toBe(401);
  });

  it("lists only the caller's own thoughts, newest first", async () => {
    const { cookie: cookieA } = await signedUp();
    await createThought(req("/api/v1/thoughts", { ...thought, title: "First" }, { cookie: cookieA }));
    await createThought(req("/api/v1/thoughts", { ...thought, title: "Second" }, { cookie: cookieA }));

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other3@example.com" }));
    const cookieB = cookieOf(otherRes);
    await createThought(req("/api/v1/thoughts", { ...thought, title: "Someone else's" }, { cookie: cookieB }));

    const res = await listThoughts(getReq("/api/v1/thoughts", { cookie: cookieA }));
    const { thoughts } = await json(res);
    expect(thoughts.map((t: any) => t.title)).toEqual(["Second", "First"]);
  });
});

describe("PATCH /api/v1/thoughts/[id]", () => {
  it("requires a signed-in user", async () => {
    expect((await updateThought(req("/api/v1/thoughts/x", thought), withId("x"))).status).toBe(401);
  });

  it("updates every field in place, including toggling favorite", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createThought(req("/api/v1/thoughts", thought, { cookie })));
    const res = await updateThought(req(`/api/v1/thoughts/${created.thought.id}`, { ...thought, title: "Changed", favorite: true }, { cookie }), withId(created.thought.id));
    expect(res.status).toBe(200);
    const { thought: updated } = await json(res);
    expect(updated.title).toBe("Changed");
    expect(updated.favorite).toBe(true);
  });

  it("404s for an id that doesn't exist", async () => {
    const { cookie } = await signedUp();
    const res = await updateThought(req("/api/v1/thoughts/does-not-exist", thought, { cookie }), withId("does-not-exist"));
    expect(res.status).toBe(404);
  });

  it("404s for someone else's thought, and leaves it unchanged", async () => {
    const { cookie: cookieA } = await signedUp();
    const created = await json(await createThought(req("/api/v1/thoughts", thought, { cookie: cookieA })));

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other4@example.com" }));
    const cookieB = cookieOf(otherRes);
    const res = await updateThought(req(`/api/v1/thoughts/${created.thought.id}`, { ...thought, title: "Hijacked" }, { cookie: cookieB }), withId(created.thought.id));
    expect(res.status).toBe(404);

    const row = await getDb().thought.findUniqueOrThrow({ where: { id: created.thought.id } });
    expect(row.title).toBe(thought.title);
  });
});

describe("DELETE /api/v1/thoughts/[id]", () => {
  it("requires a signed-in user", async () => {
    expect((await removeThought(deleteReq("/api/v1/thoughts/x"), withId("x"))).status).toBe(401);
  });

  it("deletes the caller's own thought", async () => {
    const { cookie } = await signedUp();
    const created = await json(await createThought(req("/api/v1/thoughts", thought, { cookie })));
    const res = await removeThought(deleteReq(`/api/v1/thoughts/${created.thought.id}`, { cookie }), withId(created.thought.id));
    expect(res.status).toBe(204);
    expect(await getDb().thought.findUnique({ where: { id: created.thought.id } })).toBeNull();
  });

  it("404s for someone else's thought, and leaves it in place", async () => {
    const { cookie: cookieA } = await signedUp();
    const created = await json(await createThought(req("/api/v1/thoughts", thought, { cookie: cookieA })));
    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other5@example.com" }));
    const cookieB = cookieOf(otherRes);
    const res = await removeThought(deleteReq(`/api/v1/thoughts/${created.thought.id}`, { cookie: cookieB }), withId(created.thought.id));
    expect(res.status).toBe(404);
    expect(await getDb().thought.findUnique({ where: { id: created.thought.id } })).not.toBeNull();
  });
});
