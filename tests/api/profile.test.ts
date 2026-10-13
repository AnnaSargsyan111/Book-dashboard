import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as onboarding } from "@/app/api/v1/onboarding/route";
import { POST as updateProfile } from "@/app/api/v1/profile/route";
import { getDb } from "@/server/db/client";
import { findProfile } from "@/server/modules/profile/profile.repository";

const ORIGIN = "http://localhost:3000";
const account = { firstName: "Anna", lastName: "Sargsyan", email: "anna@example.com", password: "Sunrise#2026" };
const answers = { genres: ["fantasy", "poetry"], favoriteAuthors: ["Ursula K. Le Guin"], aboutMe: "I read slowly." };

function req(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "content-type": "application/json", "x-forwarded-for": "10.0.0.11", ...headers },
    body: JSON.stringify(body),
  });
}
const json = async (res: Response) => (await res.json()) as any;
const cookieOf = (res: Response) => res.headers.get("set-cookie")?.split(";")[0] ?? "";

async function signedUp() {
  const res = await register(req("/api/v1/auth/register", account));
  return { cookie: cookieOf(res), user: (await json(res)).user };
}

async function onboarded() {
  const { cookie, user } = await signedUp();
  await onboarding(req("/api/v1/onboarding", answers, { cookie }));
  return { cookie, user };
}

beforeEach(async () => {
  const db = getDb();
  await db.rateLimitEvent.deleteMany();
  await db.userProfile.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
});

describe("POST /api/v1/profile (the About Me page)", () => {
  it("requires a signed-in user", async () => {
    const res = await updateProfile(req("/api/v1/profile", answers));
    expect(res.status).toBe(401);
  });

  it("requires onboarding to be finished first", async () => {
    const { cookie } = await signedUp();
    const res = await updateProfile(req("/api/v1/profile", answers, { cookie }));
    expect(res.status).toBe(403);
  });

  it("persists a change to all three fields and echoes back the saved values", async () => {
    const { cookie, user } = await onboarded();
    const next = { genres: ["mystery"], favoriteAuthors: ["Agatha Christie"], aboutMe: "Now I only read mysteries." };
    const res = await updateProfile(req("/api/v1/profile", next, { cookie }));
    expect(res.status).toBe(200);
    expect((await json(res)).profile).toEqual(next);
    expect(await findProfile(user.id)).toEqual(next);
  });

  it("every field can be cleared to empty in one save, and that is persisted", async () => {
    const { cookie, user } = await onboarded();
    const cleared = { genres: [], favoriteAuthors: [], aboutMe: "" };
    const res = await updateProfile(req("/api/v1/profile", cleared, { cookie }));
    expect(res.status).toBe(200);
    expect((await json(res)).profile).toEqual(cleared);
    expect(await findProfile(user.id)).toEqual(cleared);
  });

  it("enforces the 5-genre limit on the server, in the request's language", async () => {
    const { cookie } = await onboarded();
    const six = ["fiction", "classics", "mystery", "thriller", "crime", "fantasy"];
    const en = await updateProfile(req("/api/v1/profile", { ...answers, genres: six }, { cookie }));
    expect(en.status).toBe(400);
    expect((await json(en)).error.fields.genres.message).toBe("You can select up to 5 genres");

    const hy = await updateProfile(req("/api/v1/profile", { ...answers, genres: six }, { cookie: `${cookie}; NEXT_LOCALE=hy` }));
    expect((await json(hy)).error.fields.genres.message).toBe("Թույլատրվում է ընտրել առավելագույնը 5 ժանր");
  });

  it("a failed validation saves nothing", async () => {
    const { cookie, user } = await onboarded();
    const six = ["fiction", "classics", "mystery", "thriller", "crime", "fantasy"];
    await updateProfile(req("/api/v1/profile", { ...answers, genres: six }, { cookie }));
    expect(await findProfile(user.id)).toEqual(answers);
  });

  it("cannot be used to change name or email (unknown fields are rejected)", async () => {
    const { cookie } = await onboarded();
    const res = await updateProfile(req("/api/v1/profile", { ...answers, firstName: "Mallory" }, { cookie }));
    expect(res.status).toBe(400);
  });

  it("rejects cross-origin requests", async () => {
    const { cookie } = await onboarded();
    const res = await updateProfile(req("/api/v1/profile", answers, { cookie, origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });
});
