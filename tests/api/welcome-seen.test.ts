import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as onboarding } from "@/app/api/v1/onboarding/route";
import { POST as welcomeSeen } from "@/app/api/v1/me/welcome-seen/route";
import { getDb } from "@/server/db/client";

const ORIGIN = "http://localhost:3000";
const account = { firstName: "Anna", lastName: "Sargsyan", email: "anna@example.com", password: "Sunrise#2026" };
const answers = { genres: [], favoriteAuthors: [], aboutMe: "I read slowly." };

function req(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "content-type": "application/json", "x-forwarded-for": "10.0.0.9", ...headers },
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

describe("POST /api/v1/me/welcome-seen", () => {
  it("a freshly registered user has not seen the Welcome Modal", async () => {
    const { user } = await signedUp();
    expect(user.welcomeModalSeen).toBe(false);
  });

  it("requires a signed-in user", async () => {
    const res = await welcomeSeen(req("/api/v1/me/welcome-seen", {}));
    expect(res.status).toBe(401);
  });

  it("marks it seen, and this survives a later login", async () => {
    const { cookie } = await signedUp();
    const res = await welcomeSeen(req("/api/v1/me/welcome-seen", {}, { cookie }));
    expect(res.status).toBe(200);
    expect((await json(res)).user.welcomeModalSeen).toBe(true);

    const login1 = await login(req("/api/v1/auth/login", { email: account.email, password: account.password }));
    expect((await json(login1)).user.welcomeModalSeen).toBe(true);
  });

  it("is idempotent: calling it again is harmless", async () => {
    const { cookie } = await signedUp();
    await welcomeSeen(req("/api/v1/me/welcome-seen", {}, { cookie }));
    const again = await welcomeSeen(req("/api/v1/me/welcome-seen", {}, { cookie }));
    expect(again.status).toBe(200);
    expect((await json(again)).user.welcomeModalSeen).toBe(true);
  });

  it("is independent of onboarding: completing onboarding does not mark it seen by itself", async () => {
    const { cookie, user } = await signedUp();
    await onboarding(req("/api/v1/onboarding", answers, { cookie }));
    expect((await getDb().user.findUniqueOrThrow({ where: { id: user.id } })).welcomeModalSeen).toBe(false);
  });

  it("rejects cross-origin requests", async () => {
    const { cookie } = await signedUp();
    const res = await welcomeSeen(req("/api/v1/me/welcome-seen", {}, { cookie, origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });
});
