import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as onboard } from "@/app/api/v1/onboarding/route";
import { POST as recommend } from "@/app/api/v1/mystery/recommend/route";
import { POST as preview } from "@/app/api/v1/mystery/recommend/preview/route";
import { POST as commit } from "@/app/api/v1/mystery/recommend/commit/route";
import { POST as saveAddress } from "@/app/api/v1/mystery/pick/[id]/address/route";
import { POST as placeOrder } from "@/app/api/v1/mystery/pick/[id]/order/route";
import { POST as submitFeedback } from "@/app/api/v1/mystery/pick/[id]/feedback/route";
import { CATALOG } from "@/server/mystery/catalog";
import { getDb } from "@/server/db/client";

const ORIGIN = "http://localhost:3000";
const account = { firstName: "Anna", lastName: "Sargsyan", email: "anna@example.com", password: "Sunrise#2026" };
const address = {
  fullName: "Anna Sargsyan",
  addressLine1: "1 Mesrop Mashtots Ave",
  addressLine2: "",
  city: "Yerevan",
  region: "",
  postalCode: "0001",
  country: "Armenia",
  phone: "+37477123456",
};

function req(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "content-type": "application/json", "x-forwarded-for": "10.0.0.20", ...headers },
    body: JSON.stringify(body),
  });
}
const json = async (res: Response) => (await res.json()) as any;
const cookieOf = (res: Response) => res.headers.get("set-cookie")?.split(";")[0] ?? "";
const withId = (id: string) => ({ params: Promise.resolve({ id }) });

async function signedUpAndOnboarded() {
  const res = await register(req("/api/v1/auth/register", account));
  const cookie = cookieOf(res);
  await onboard(req("/api/v1/onboarding", { genres: [], favoriteAuthors: [], aboutMe: "I love a good story." }, { cookie }));
  return { cookie, user: (await json(res)).user };
}

beforeEach(async () => {
  const db = getDb();
  await db.rateLimitEvent.deleteMany();
  await db.mysteryPick.deleteMany();
  await db.book.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
});

describe("POST /api/v1/mystery/recommend", () => {
  it("requires a signed-in user", async () => {
    expect((await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }))).status).toBe(401);
  });

  it("requires onboarding to be finished", async () => {
    const res = await register(req("/api/v1/auth/register", account));
    const cookie = cookieOf(res);
    const result = await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie }));
    expect(result.status).toBe(403);
  });

  it("requires at least one mood", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const res = await recommend(req("/api/v1/mystery/recommend", { moods: [], revealMode: "show_now" }, { cookie }));
    expect(res.status).toBe(400);
    expect((await json(res)).error.fields.moods.key).toBe("validation.moodRequired");
  });

  it("requires a reveal mode", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const res = await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"] }, { cookie }));
    expect(res.status).toBe(400);
  });

  it("show_now reveals the book; keep_mystery withholds it", async () => {
    const { cookie } = await signedUpAndOnboarded();

    const shown = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], genres: ["fantasy"], revealMode: "show_now" }, { cookie })));
    expect(shown.book.title).toBeTruthy();
    expect(shown.book.author).toBeTruthy();

    const hidden = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], genres: ["fantasy"], revealMode: "keep_mystery" }, { cookie })));
    expect(hidden.book.title).toBeNull();
    expect(hidden.book.author).toBeNull();
    expect(hidden.book.coverUrl).toBeNull();
    // Non-identifying fields still come through either way.
    expect(hidden.book.genre).toBe("fantasy");
  });

  it("persists the pick under a real database id, distinct from the catalog slug", async () => {
    const { cookie, user } = await signedUpAndOnboarded();
    const res = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie })));

    const row = await getDb().mysteryPick.findUniqueOrThrow({ where: { id: res.pickId } });
    expect(row.userId).toBe(user.id);
    expect(row.bookSlug).not.toBe(res.pickId);
  });

  it("excludes a book already recommended to this user from the next call", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const first = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], genres: ["fantasy"], revealMode: "show_now" }, { cookie })));
    const second = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], genres: ["fantasy"], revealMode: "show_now" }, { cookie })));
    expect(second.book.title).not.toBe(first.book.title);
  });

  it("returns a real 'no match' response — never an unrelated substitute — once the whole catalog is exhausted", async () => {
    const { cookie, user } = await signedUpAndOnboarded();
    await getDb().mysteryPick.createMany({
      data: CATALOG.map((b) => ({ userId: user.id, bookSlug: b.slug, revealMode: "show_now", moods: ["cozy"] })),
    });
    const res = await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie }));
    expect(res.status).toBe(503);
    expect((await json(res)).error.code).toBe("NO_MYSTERY_AVAILABLE");
  });

  it("rejects cross-origin requests", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const res = await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie, origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/v1/mystery/recommend/preview (Show Me Now candidate browsing)", () => {
  it("requires a signed-in user", async () => {
    expect((await preview(req("/api/v1/mystery/recommend/preview", { moods: ["cozy"] }))).status).toBe(401);
  });

  it("returns a real candidate but never persists a pick", async () => {
    const { cookie, user } = await signedUpAndOnboarded();
    const res = await json(await preview(req("/api/v1/mystery/recommend/preview", { moods: ["cozy"], genres: ["fantasy"] }, { cookie })));
    expect(res.book.title).toBeTruthy();
    expect(res.bookSlug).toBeTruthy();

    const picks = await getDb().mysteryPick.findMany({ where: { userId: user.id } });
    expect(picks).toHaveLength(0);
  });

  it("excludes this round's own excludeSlugs so a reroll doesn't repeat one already shown", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const first = await json(await preview(req("/api/v1/mystery/recommend/preview", { moods: ["cozy"] }, { cookie })));
    const second = await json(
      await preview(req("/api/v1/mystery/recommend/preview", { moods: ["cozy"], excludeSlugs: [first.bookSlug] }, { cookie })),
    );
    expect(second.bookSlug).not.toBe(first.bookSlug);
  });

  it("a book left uncommitted by preview stays eligible for a later real recommend() call", async () => {
    const { cookie, user } = await signedUpAndOnboarded();
    const previewed = await json(await preview(req("/api/v1/mystery/recommend/preview", { moods: ["cozy"] }, { cookie })));

    // Exhaust every other catalog title so the only one left eligible is the one just previewed-but-not-committed —
    // if preview had persisted a pick, this would 503 instead.
    await getDb().mysteryPick.createMany({
      data: CATALOG.filter((b) => b.slug !== previewed.bookSlug).map((b) => ({ userId: user.id, bookSlug: b.slug, revealMode: "show_now", moods: ["cozy"] })),
    });

    const res = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie })));
    expect(res.book.title).toBe(previewed.book.title);
  });

  it("503s once every eligible title has actually been recommended before", async () => {
    const { cookie, user } = await signedUpAndOnboarded();
    await getDb().mysteryPick.createMany({
      data: CATALOG.map((b) => ({ userId: user.id, bookSlug: b.slug, revealMode: "show_now", moods: ["cozy"] })),
    });
    const res = await preview(req("/api/v1/mystery/recommend/preview", { moods: ["cozy"] }, { cookie }));
    expect(res.status).toBe(503);
    expect((await json(res)).error.code).toBe("NO_MYSTERY_AVAILABLE");
  });
});

describe("POST /api/v1/mystery/recommend/commit (finalizing a Show Me Now candidate)", () => {
  it("requires a signed-in user", async () => {
    expect((await commit(req("/api/v1/mystery/recommend/commit", { moods: ["cozy"], bookSlug: "legends-and-lattes" }))).status).toBe(401);
  });

  it("persists exactly the previewed candidate, not a re-scored pick", async () => {
    const { cookie, user } = await signedUpAndOnboarded();
    const previewed = await json(await preview(req("/api/v1/mystery/recommend/preview", { moods: ["cozy"] }, { cookie })));

    const res = await json(await commit(req("/api/v1/mystery/recommend/commit", { moods: ["cozy"], bookSlug: previewed.bookSlug }, { cookie })));
    expect(res.book.title).toBe(previewed.book.title);
    expect(res.pickId).toBeTruthy();

    const row = await getDb().mysteryPick.findUniqueOrThrow({ where: { id: res.pickId } });
    expect(row.userId).toBe(user.id);
    expect(row.bookSlug).toBe(previewed.bookSlug);
    expect(row.revealMode).toBe("show_now");
  });

  it("503s for a slug that isn't eligible (already recommended before)", async () => {
    const { cookie, user } = await signedUpAndOnboarded();
    const slug = CATALOG[0]!.slug;
    await getDb().mysteryPick.create({ data: { userId: user.id, bookSlug: slug, revealMode: "show_now", moods: ["cozy"] } });

    const res = await commit(req("/api/v1/mystery/recommend/commit", { moods: ["cozy"], bookSlug: slug }, { cookie }));
    expect(res.status).toBe(503);
    expect((await json(res)).error.code).toBe("NO_MYSTERY_AVAILABLE");
  });

  it("503s for a slug that doesn't exist in the catalog", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const res = await commit(req("/api/v1/mystery/recommend/commit", { moods: ["cozy"], bookSlug: "not-a-real-book" }, { cookie }));
    expect(res.status).toBe(503);
  });
});

describe("POST /api/v1/mystery/pick/[id]/address", () => {
  it("requires a signed-in user", async () => {
    expect((await saveAddress(req("/api/v1/mystery/pick/x/address", address), withId("x"))).status).toBe(401);
  });

  it("saves the address onto the caller's own pick", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie })));

    const res = await saveAddress(req(`/api/v1/mystery/pick/${pickId}/address`, address, { cookie }), withId(pickId));
    expect(res.status).toBe(200);

    const row = await getDb().mysteryPick.findUniqueOrThrow({ where: { id: pickId } });
    expect(row.city).toBe("Yerevan");
    expect(row.fullName).toBe("Anna Sargsyan");
  });

  it("requires the required fields", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie })));
    const res = await saveAddress(req(`/api/v1/mystery/pick/${pickId}/address`, { ...address, city: "" }, { cookie }), withId(pickId));
    expect(res.status).toBe(400);
  });

  it("404s for someone else's pick", async () => {
    const { cookie: cookieA } = await signedUpAndOnboarded();
    const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie: cookieA })));

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other@example.com" }));
    const cookieB = cookieOf(otherRes);
    await onboard(req("/api/v1/onboarding", { genres: [], favoriteAuthors: [], aboutMe: "x" }, { cookie: cookieB }));

    const res = await saveAddress(req(`/api/v1/mystery/pick/${pickId}/address`, address, { cookie: cookieB }), withId(pickId));
    expect(res.status).toBe(404);
  });

  it("404s for a pick id that doesn't exist", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const res = await saveAddress(req("/api/v1/mystery/pick/does-not-exist/address", address, { cookie }), withId("does-not-exist"));
    expect(res.status).toBe(404);
  });
});

const order = { paymentMethod: "card", acknowledgeNonReturnable: true };

async function pickedAndAddressed(cookie: string) {
  const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie })));
  await saveAddress(req(`/api/v1/mystery/pick/${pickId}/address`, address, { cookie }), withId(pickId));
  return pickId as string;
}

describe("POST /api/v1/mystery/pick/[id]/order", () => {
  it("requires a signed-in user", async () => {
    expect((await placeOrder(req("/api/v1/mystery/pick/x/order", order), withId("x"))).status).toBe(401);
  });

  it("places the order once an address is on file", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const pickId = await pickedAndAddressed(cookie);

    const res = await placeOrder(req(`/api/v1/mystery/pick/${pickId}/order`, order, { cookie }), withId(pickId));
    expect(res.status).toBe(200);

    const row = await getDb().mysteryPick.findUniqueOrThrow({ where: { id: pickId } });
    expect(row.paymentMethod).toBe("card");
    expect(row.orderedAt).not.toBeNull();
  });

  it("rejects an order with no address on file yet", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie })));

    const res = await placeOrder(req(`/api/v1/mystery/pick/${pickId}/order`, order, { cookie }), withId(pickId));
    expect(res.status).toBe(400);
  });

  it("requires the non-returnable acknowledgment", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const pickId = await pickedAndAddressed(cookie);

    const res = await placeOrder(req(`/api/v1/mystery/pick/${pickId}/order`, { paymentMethod: "card" }, { cookie }), withId(pickId));
    expect(res.status).toBe(400);
  });

  it("re-checks availability and returns 409 BOOK_OUT_OF_STOCK for a book that became unavailable (Section 13.26)", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const pickId = await pickedAndAddressed(cookie);
    const row = await getDb().mysteryPick.findUniqueOrThrow({ where: { id: pickId } });
    const catalogBook = CATALOG.find((b) => b.slug === row.bookSlug)!;

    catalogBook.available = false;
    try {
      const res = await placeOrder(req(`/api/v1/mystery/pick/${pickId}/order`, order, { cookie }), withId(pickId));
      expect(res.status).toBe(409);
      expect((await json(res)).error.code).toBe("BOOK_OUT_OF_STOCK");
    } finally {
      catalogBook.available = true;
    }
  });

  it("404s for someone else's pick", async () => {
    const { cookie: cookieA } = await signedUpAndOnboarded();
    const pickId = await pickedAndAddressed(cookieA);

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other2@example.com" }));
    const cookieB = cookieOf(otherRes);
    await onboard(req("/api/v1/onboarding", { genres: [], favoriteAuthors: [], aboutMe: "x" }, { cookie: cookieB }));

    const res = await placeOrder(req(`/api/v1/mystery/pick/${pickId}/order`, order, { cookie: cookieB }), withId(pickId));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/mystery/pick/[id]/feedback", () => {
  it("requires a signed-in user", async () => {
    expect((await submitFeedback(req("/api/v1/mystery/pick/x/feedback", { rating: "loved" }), withId("x"))).status).toBe(401);
  });

  it("saves a rating and optional tags onto the caller's own pick", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie })));

    const res = await submitFeedback(req(`/api/v1/mystery/pick/${pickId}/feedback`, { rating: "loved", tags: ["genre", "mood"] }, { cookie }), withId(pickId));
    expect(res.status).toBe(200);

    const row = await getDb().mysteryPick.findUniqueOrThrow({ where: { id: pickId } });
    expect(row.feedbackRating).toBe("loved");
    expect(row.feedbackTags).toEqual(["genre", "mood"]);
  });

  it("requires a rating", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie })));
    const res = await submitFeedback(req(`/api/v1/mystery/pick/${pickId}/feedback`, {}, { cookie }), withId(pickId));
    expect(res.status).toBe(400);
  });

  it("404s for someone else's pick", async () => {
    const { cookie: cookieA } = await signedUpAndOnboarded();
    const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie: cookieA })));

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other3@example.com" }));
    const cookieB = cookieOf(otherRes);
    await onboard(req("/api/v1/onboarding", { genres: [], favoriteAuthors: [], aboutMe: "x" }, { cookie: cookieB }));

    const res = await submitFeedback(req(`/api/v1/mystery/pick/${pickId}/feedback`, { rating: "loved" }, { cookie: cookieB }), withId(pickId));
    expect(res.status).toBe(404);
  });
});
