import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as onboarding } from "@/app/api/v1/onboarding/route";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { getDb } from "@/server/db/client";
import { findProfile } from "@/server/modules/profile/profile.repository";

const ORIGIN = "http://localhost:3000";
const account = { firstName: "Anna", lastName: "Sargsyan", email: "anna@example.com", password: "Sunrise#2026" };
const answers = { genres: ["fantasy", "poetry"], favoriteAuthors: ["Ուիլյամ Սարոյան", "Ursula K. Le Guin"], aboutMe: "I read slowly.\nAnd underline a lot." };

function req(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "content-type": "application/json", "x-forwarded-for": "10.0.0.7", ...headers },
    body: JSON.stringify(body),
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
  await db.userProfile.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
});

describe("POST /api/v1/onboarding", () => {
  it("requires a signed-in user", async () => {
    const res = await onboarding(req("/api/v1/onboarding", answers));
    expect(res.status).toBe(401);
    expect(await getDb().userProfile.count()).toBe(0);
  });

  it("saves the profile and completes onboarding in one step", async () => {
    const { cookie, user } = await signedUp();
    expect(user.onboardingCompleted).toBe(false);

    const res = await onboarding(req("/api/v1/onboarding", answers, { cookie }));
    expect(res.status).toBe(200);
    expect((await json(res)).user.onboardingCompleted).toBe(true);

    const row = await getDb().user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.onboardingCompleted).toBe(true);
    expect(await findProfile(user.id)).toEqual({
      genres: ["fantasy", "poetry"],
      favoriteAuthors: ["Ուիլյամ Սարոյան", "Ursula K. Le Guin"],
      aboutMe: "I read slowly.\nAnd underline a lot.",
    });
  });

  it("works with only About Me (genres and authors optional)", async () => {
    const { cookie, user } = await signedUp();
    const res = await onboarding(req("/api/v1/onboarding", { genres: [], favoriteAuthors: [], aboutMe: "Just this." }, { cookie }));
    expect(res.status).toBe(200);
    expect(await findProfile(user.id)).toMatchObject({ genres: [], favoriteAuthors: [], aboutMe: "Just this." });
  });

  it("rejects an empty About Me with the localized required message, and saves nothing", async () => {
    const { cookie, user } = await signedUp();
    const res = await onboarding(req("/api/v1/onboarding", { ...answers, aboutMe: "  " }, { cookie: `${cookie}; NEXT_LOCALE=hy` }));
    expect(res.status).toBe(400);
    const { error } = await json(res);
    expect(error.fields.aboutMe).toEqual({ key: "validation.required", message: "Պարտադիր լրացման դաշտ" });
    expect((await getDb().user.findUniqueOrThrow({ where: { id: user.id } })).onboardingCompleted).toBe(false);
    expect(await getDb().userProfile.count()).toBe(0);
  });

  it("enforces the 5-genre limit on the server, in the request's language", async () => {
    const { cookie } = await signedUp();
    const six = ["fiction", "classics", "mystery", "thriller", "crime", "fantasy"];
    const en = await onboarding(req("/api/v1/onboarding", { ...answers, genres: six }, { cookie }));
    expect((await json(en)).error.fields.genres.message).toBe("You can select up to 5 genres");
    const hy = await onboarding(req("/api/v1/onboarding", { ...answers, genres: six }, { cookie: `${cookie}; NEXT_LOCALE=hy` }));
    expect((await json(hy)).error.fields.genres.message).toBe("Թույլատրվում է ընտրել առավելագույնը 5 ժանր");
  });

  it("cannot be completed twice, and the first answers are kept", async () => {
    const { cookie, user } = await signedUp();
    await onboarding(req("/api/v1/onboarding", answers, { cookie }));
    const again = await onboarding(req("/api/v1/onboarding", { ...answers, aboutMe: "Overwrite attempt" }, { cookie }));
    expect(again.status).toBe(409);
    expect((await json(again)).error.code).toBe("ONBOARDING_ALREADY_COMPLETED");
    expect((await findProfile(user.id))!.aboutMe).toBe(answers.aboutMe);
  });

  it("two simultaneous submissions: exactly one wins", async () => {
    const { cookie } = await signedUp();
    const results = await Promise.all([1, 2, 3].map(() => onboarding(req("/api/v1/onboarding", answers, { cookie }))));
    expect(results.map((r) => r.status).sort()).toEqual([200, 409, 409]);
    expect(await getDb().userProfile.count()).toBe(1);
  });

  it("cannot be used to change name or email (unknown fields are rejected)", async () => {
    const { cookie, user } = await signedUp();
    const res = await onboarding(req("/api/v1/onboarding", { ...answers, firstName: "Mallory", email: "x@y.com" }, { cookie }));
    expect(res.status).toBe(400);
    const row = await getDb().user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row).toMatchObject({ firstName: "Anna", email: "anna@example.com", onboardingCompleted: false });
  });

  it("rejects cross-origin requests", async () => {
    const { cookie } = await signedUp();
    const res = await onboarding(req("/api/v1/onboarding", answers, { cookie, origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });

  it("a completed user stays completed across login (never shown onboarding again)", async () => {
    const { cookie } = await signedUp();
    await onboarding(req("/api/v1/onboarding", answers, { cookie }));
    const res = await login(req("/api/v1/auth/login", { email: account.email, password: account.password }));
    expect((await json(res)).user.onboardingCompleted).toBe(true);
  });

  it("a user who has NOT completed it still gets onboarding after login", async () => {
    await signedUp();
    const res = await login(req("/api/v1/auth/login", { email: account.email, password: account.password }));
    expect((await json(res)).user.onboardingCompleted).toBe(false);
  });
});
