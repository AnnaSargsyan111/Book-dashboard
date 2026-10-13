import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { GET as session } from "@/app/api/v1/auth/session/route";
import { POST as updateAccount } from "@/app/api/v1/me/account/route";
import { POST as changePassword } from "@/app/api/v1/auth/change-password/route";
import { getDb } from "@/server/db/client";

const ORIGIN = "http://localhost:3000";
const account = { firstName: "Anna", lastName: "Sargsyan", email: "anna@example.com", password: "Sunrise#2026" };

function req(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "content-type": "application/json", "x-forwarded-for": "10.0.0.13", ...headers },
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
  await db.session.deleteMany();
  await db.user.deleteMany();
});

describe("POST /api/v1/me/account (Settings' Account Details)", () => {
  it("requires a signed-in user", async () => {
    const res = await updateAccount(req("/api/v1/me/account", { firstName: "Jane", lastName: "Austen" }));
    expect(res.status).toBe(401);
  });

  it("updates and persists First/Last Name, and returns the updated user", async () => {
    const { cookie, user } = await signedUp();
    const res = await updateAccount(req("/api/v1/me/account", { firstName: "Anya", lastName: "Sargsyan-Petrosyan" }, { cookie }));
    expect(res.status).toBe(200);
    expect((await json(res)).user).toMatchObject({ id: user.id, firstName: "Anya", lastName: "Sargsyan-Petrosyan", email: "anna@example.com" });

    const row = await getDb().user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row).toMatchObject({ firstName: "Anya", lastName: "Sargsyan-Petrosyan" });
  });

  it("never accepts email — the account keeps its original address", async () => {
    const { cookie, user } = await signedUp();
    const res = await updateAccount(req("/api/v1/me/account", { firstName: "Anya", lastName: "Sargsyan", email: "someone-else@example.com" }, { cookie }));
    expect(res.status).toBe(400);
    expect((await getDb().user.findUniqueOrThrow({ where: { id: user.id } })).email).toBe("anna@example.com");
  });

  it("rejects non-Latin names, in the request's language", async () => {
    const { cookie } = await signedUp();
    const res = await updateAccount(req("/api/v1/me/account", { firstName: "Աննա", lastName: "Sargsyan" }, { cookie: `${cookie}; NEXT_LOCALE=hy` }));
    expect(res.status).toBe(400);
    expect((await json(res)).error.fields.firstName.message).toBe("Լրացրեք լատինատառ");
  });
});

describe("POST /api/v1/auth/change-password (Settings' Security)", () => {
  it("requires a signed-in user", async () => {
    const res = await changePassword(req("/api/v1/auth/change-password", { newPassword: "Newpass#2026", confirmPassword: "Newpass#2026" }));
    expect(res.status).toBe(401);
  });

  it("rejects a mismatch and changes nothing", async () => {
    const { cookie } = await signedUp();
    const res = await changePassword(req("/api/v1/auth/change-password", { newPassword: "Newpass#2026", confirmPassword: "Different#2026" }, { cookie }));
    expect(res.status).toBe(400);
    expect((await json(res)).error.fields.confirmPassword.message).toBe("Passwords don’t match.");

    // the OLD password still logs in
    const stillWorks = await login(req("/api/v1/auth/login", { email: account.email, password: account.password }));
    expect(stillWorks.status).toBe(200);
  });

  it("changes the password: the new one logs in, the old one no longer does", async () => {
    const { cookie } = await signedUp();
    const res = await changePassword(req("/api/v1/auth/change-password", { newPassword: "Newpass#2026", confirmPassword: "Newpass#2026" }, { cookie }));
    expect(res.status).toBe(200);

    const oldFails = await login(req("/api/v1/auth/login", { email: account.email, password: account.password }));
    expect(oldFails.status).toBe(401);

    const newWorks = await login(req("/api/v1/auth/login", { email: account.email, password: "Newpass#2026" }));
    expect(newWorks.status).toBe(200);
  });

  it("keeps the caller's own session valid but signs every other session out", async () => {
    const { cookie: sessionA } = await signedUp();
    await login(req("/api/v1/auth/login", { email: account.email, password: account.password })); // a second session, B
    expect(await getDb().session.count()).toBe(2);

    await changePassword(req("/api/v1/auth/change-password", { newPassword: "Newpass#2026", confirmPassword: "Newpass#2026" }, { cookie: sessionA }));

    // A (the one that made the change) still works
    const getSession = () =>
      new NextRequest(`${ORIGIN}/api/v1/auth/session`, { method: "GET", headers: { host: "localhost:3000", cookie: sessionA } });
    expect((await session(getSession())).status).toBe(200);

    // B was signed out: only one session remains
    expect(await getDb().session.count()).toBe(1);
  });

  it("rejects a weak new password, in the request's language", async () => {
    const { cookie } = await signedUp();
    const res = await changePassword(req("/api/v1/auth/change-password", { newPassword: "weak", confirmPassword: "weak" }, { cookie: `${cookie}; NEXT_LOCALE=hy` }));
    expect(res.status).toBe(400);
    expect((await json(res)).error.fields.newPassword.message).toBe("Գաղտնաբառը չի բավարարում բոլոր պահանջներին");
  });

  it("rejects cross-origin requests", async () => {
    const { cookie } = await signedUp();
    const res = await changePassword(req("/api/v1/auth/change-password", { newPassword: "Newpass#2026", confirmPassword: "Newpass#2026" }, { cookie, origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });
});
