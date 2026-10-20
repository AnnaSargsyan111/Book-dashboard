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
import { DELETE as removeView } from "@/app/api/v1/mystery/recommendation-view/[id]/route";
import { POST as reviewView } from "@/app/api/v1/mystery/recommendation-view/[id]/feedback/route";
import { POST as addViewToLibrary } from "@/app/api/v1/mystery/recommendation-view/[id]/add-to-library/route";
import { devOutbox } from "@/server/mail/mailer";
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

describe("POST /api/v1/mystery/recommendation-view/[id]/feedback", () => {
  const bookBody = { title: "Dune", author: "Frank Herbert", status: "read", rating: 4, genres: [], plot: "", characters: [], quotes: [], commentary: "" };

  async function viewFor(cookie: string) {
    await preview(req("/api/v1/mystery/recommend/preview", { moods: ["cozy"] }, { cookie }));
    return getDb().mysteryRecommendationView.findFirstOrThrow();
  }

  it("requires a signed-in user", async () => {
    expect((await reviewView(req("/api/v1/mystery/recommendation-view/x/feedback", { rating: "loved" }), withId("x"))).status).toBe(401);
  });

  it("saves a rating and tags on a recommendation that was added to the library", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const view = await viewFor(cookie);
    await addViewToLibrary(req(`/api/v1/mystery/recommendation-view/${view.id}/add-to-library`, bookBody, { cookie }), withId(view.id));

    const res = await reviewView(req(`/api/v1/mystery/recommendation-view/${view.id}/feedback`, { rating: "loved", tags: ["genre", "mood"] }, { cookie }), withId(view.id));
    expect(res.status).toBe(200);
    const row = await getDb().mysteryRecommendationView.findUniqueOrThrow({ where: { id: view.id } });
    expect(row.feedbackRating).toBe("loved");
    expect(row.feedbackTags).toEqual(["genre", "mood"]);

    // A review is left once: a second one is refused and the first stays.
    const again = await reviewView(req(`/api/v1/mystery/recommendation-view/${view.id}/feedback`, { rating: "okay" }, { cookie }), withId(view.id));
    expect(again.status).toBe(409);
    expect((await json(again)).error.code).toBe("ALREADY_REVIEWED");
    const kept = await getDb().mysteryRecommendationView.findUniqueOrThrow({ where: { id: view.id } });
    expect(kept.feedbackRating).toBe("loved");
    expect(kept.feedbackTags).toEqual(["genre", "mood"]);
  });

  it("404s while the recommendation has not been added to the library", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const view = await viewFor(cookie);
    const res = await reviewView(req(`/api/v1/mystery/recommendation-view/${view.id}/feedback`, { rating: "loved" }, { cookie }), withId(view.id));
    expect(res.status).toBe(404);
  });

  it("requires a rating", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const view = await viewFor(cookie);
    await addViewToLibrary(req(`/api/v1/mystery/recommendation-view/${view.id}/add-to-library`, bookBody, { cookie }), withId(view.id));
    const res = await reviewView(req(`/api/v1/mystery/recommendation-view/${view.id}/feedback`, {}, { cookie }), withId(view.id));
    expect(res.status).toBe(400);
  });

  it("404s for someone else's recommendation", async () => {
    const { cookie: cookieA } = await signedUpAndOnboarded();
    const view = await viewFor(cookieA);
    await addViewToLibrary(req(`/api/v1/mystery/recommendation-view/${view.id}/add-to-library`, bookBody, { cookie: cookieA }), withId(view.id));

    const otherRes = await register(req("/api/v1/auth/register", { ...account, email: "other4@example.com" }));
    const cookieB = cookieOf(otherRes);
    await onboard(req("/api/v1/onboarding", { genres: [], favoriteAuthors: [], aboutMe: "x" }, { cookie: cookieB }));

    const res = await reviewView(req(`/api/v1/mystery/recommendation-view/${view.id}/feedback`, { rating: "loved" }, { cookie: cookieB }), withId(view.id));
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/mystery/recommendation-view/[id]", () => {
  it("removes the card but keeps the library book it became", async () => {
    const { cookie } = await signedUpAndOnboarded();
    await preview(req("/api/v1/mystery/recommend/preview", { moods: ["cozy"] }, { cookie }));
    const view = await getDb().mysteryRecommendationView.findFirstOrThrow();
    await addViewToLibrary(
      req(`/api/v1/mystery/recommendation-view/${view.id}/add-to-library`, { title: "Dune", author: "Frank Herbert", status: "read", rating: 4, genres: [], plot: "", characters: [], quotes: [], commentary: "" }, { cookie }),
      withId(view.id),
    );

    const res = await removeView(
      new NextRequest(`${ORIGIN}/api/v1/mystery/recommendation-view/${view.id}`, { method: "DELETE", headers: { host: "localhost:3000", origin: ORIGIN, "x-forwarded-for": "10.0.0.20", cookie } }),
      withId(view.id),
    );
    expect(res.status).toBe(204);

    expect(await getDb().mysteryRecommendationView.count()).toBe(0);
    const books = await getDb().book.findMany();
    expect(books).toHaveLength(1);
    expect(books[0]!.sourceMysteryViewId).toBeNull();
  });
});

describe("order emails", () => {
  async function orderedWith(revealMode: "keep_mystery" | "show_now", locale?: "hy") {
    const { cookie } = await signedUpAndOnboarded();
    const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode }, { cookie })));
    await saveAddress(req(`/api/v1/mystery/pick/${pickId}/address`, address, { cookie }), withId(pickId));
    devOutbox.length = 0;
    const orderCookie = locale ? `${cookie}; NEXT_LOCALE=${locale}` : cookie;
    const res = await placeOrder(req(`/api/v1/mystery/pick/${pickId}/order`, order, { cookie: orderCookie }), withId(pickId));
    expect(res.status).toBe(200);
    const pick = await getDb().mysteryPick.findUniqueOrThrow({ where: { id: pickId } });
    const book = CATALOG.find((b) => b.slug === pick.bookSlug)!;
    // Two emails per order: one to the owner, one to the customer (the account's own address).
    expect(devOutbox).toHaveLength(2);
    return {
      mail: devOutbox.find((m) => m.to === "owner@example.com"),
      customer: devOutbox.find((m) => m.to === account.email),
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl!,
    };
  }

  it("emails the owner when a Show me now order is placed", async () => {
    const { mail, title, author, coverUrl } = await orderedWith("show_now");
    expect(mail?.to).toBe("owner@example.com");
    // The owner's email is in Armenian only, in the same design as the customer's.
    expect(mail?.subject).toBe("Գրքի պատվեր (Ցույց տվեք հիմա)");
    expect(mail?.text).toContain("Հարգելի Աննա,");
    expect(mail?.text).toContain("ԱՆՈՒՆ ԱԶԳԱՆՈՒՆ: Anna Sargsyan");
    expect(mail?.text).toContain("ՊԱՏՎԵՐԻ ՎԱՅՐԸ: 1 Mesrop Mashtots Ave, Yerevan, 0001, Armenia");
    expect(mail?.text).toContain("ԳԻՆ: 9,400 ֏");
    expect(mail?.text).toContain(`ԸՆՏՐՎԱԾ ԳԻՐՔԸ: ${title} (Ցույց տվեք հիմա)`);
    expect(mail?.text.trimEnd().endsWith("Ձեր սիրելի MystBook-ը")).toBe(true);
    expect(mail?.html).toContain('lang="hy"');
    expect(mail?.html).toContain(title.replace(/&/g, "&amp;"));
    expect(mail?.html).toContain(author.replace(/&/g, "&amp;"));
    expect(mail?.html).toContain(coverUrl); // the owner sees the cover of the book picked
    expect(mail?.html).toContain("(Ցույց տվեք հիմա)");
  });

  it("names the real book, marked as Keep it a mystery, when that mode was chosen", async () => {
    const { mail, title } = await orderedWith("keep_mystery");
    expect(mail?.subject).toBe("Գրքի պատվեր (Թող մնա առեղծված)");
    expect(mail?.text).toContain(`ԸՆՏՐՎԱԾ ԳԻՐՔԸ: ${title} (Թող մնա առեղծված)`);
    expect(mail?.html).toContain(title.replace(/&/g, "&amp;")); // for the owner only — never for the customer
  });

  it("emails the customer, with the book, when they chose Show me now", async () => {
    const { customer, title, author, coverUrl } = await orderedWith("show_now");
    expect(customer?.subject).toBe(`Your MystBook Order Is on Its Way ✨ | ${title}`);
    expect(customer?.html).toContain("Dear Anna,");
    expect(customer?.html).toContain(title.replace(/&/g, "&amp;"));
    expect(customer?.html).toContain(author.replace(/&/g, "&amp;"));
    expect(customer?.html).not.toContain("Show me now"); // no mode row in the card
    expect(customer?.html).toContain(coverUrl); // the very cover of the book that was picked
    expect(customer?.html).toContain("9,400 ֏");
    expect(customer?.html).toContain("Anna Sargsyan");
    expect(customer?.html).toContain("Yerevan, Armenia"); // city (and region, if any), country
    expect(customer?.html).toContain("On the way");
    expect(customer?.html).toContain("Your next literary journey is one step closer. Your new book is on the way and we're delighted to have you with us.");
    expect(customer?.html).toContain("Every book opens a door to another world<"); // no full stop on that line
    expect(customer?.text).toContain(title);
    // The closing line asking the customer to call, in italics, with the phone number.
    expect(customer?.html).toContain("Please call to get in touch.");
    expect(customer?.html).toContain("(+374) 77 731713");
    expect(customer?.html).toContain("font-style:italic");
    expect(customer?.text.trimEnd().endsWith("Please call to get in touch.\n(+374) 77 731713")).toBe(true);
  });

  it("never reveals the book to a customer who chose Keep it a mystery", async () => {
    const { customer, title, author } = await orderedWith("keep_mystery");
    expect(customer?.subject).toBe("Your MystBook Order Is on Its Way ✨");
    for (const part of [customer?.subject, customer?.html, customer?.text]) {
      expect(part).not.toContain(title);
      expect(part).not.toContain(author);
    }
    expect(customer?.html).not.toContain("covers.openlibrary.org");
    expect(customer?.html).toContain("A Mystery Book");
    expect(customer?.html).not.toContain("Keep it a mystery");
  });

  it("writes the customer's email in Armenian when they use the Armenian site", async () => {
    const { customer, title } = await orderedWith("show_now", "hy");
    expect(customer?.subject).toBe(`Ձեր MystBook պատվերը ճանապարհին է ✨ | ${title}`);
    expect(customer?.html).toContain("Հարգելի Anna,");
    expect(customer?.html).not.toContain("Ցույց տվեք հիմա");
    expect(customer?.html).toContain("Ճանապարհին");
    expect(customer?.html).toContain("Ձեր հաջորդ գրական ճանապարհորդությունը մեկ քայլով ավելի մոտ է։ Ձեր պատվերը ճանապարհին է, և մենք ուրախ ենք, որ Դուք մեզ եք ընտրել։");
    expect(customer?.html).toContain("դեպի մեկ այլ աշխարհ<"); // no closing mark on that line
    expect(customer?.html).toContain('lang="hy"');
    expect(customer?.html).toContain("Կապ հաստատելու համար զանգահարեք։");
    expect(customer?.html).toContain("(+374) 77 731713");
  });

  it("sends nothing for an order that is rejected", async () => {
    const { cookie } = await signedUpAndOnboarded();
    const { pickId } = await json(await recommend(req("/api/v1/mystery/recommend", { moods: ["cozy"], revealMode: "show_now" }, { cookie })));
    devOutbox.length = 0;
    const res = await placeOrder(req(`/api/v1/mystery/pick/${pickId}/order`, order, { cookie }), withId(pickId));
    expect(res.status).toBe(400);
    expect(devOutbox).toHaveLength(0);
  });
});
