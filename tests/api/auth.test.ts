import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as forgot } from "@/app/api/v1/auth/forgot-password/route";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { POST as logout } from "@/app/api/v1/auth/logout/route";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as reset } from "@/app/api/v1/auth/reset-password/route";
import { GET as session } from "@/app/api/v1/auth/session/route";
import { getDb } from "@/server/db/client";
import { devOutbox } from "@/server/mail/mailer";
import { AUTH_POLICY } from "@/server/config/policy";

const ORIGIN = "http://localhost:3000";
const good = { firstName: "Anna", lastName: "Sargsyan", email: "anna@example.com", password: "Sunrise#2026" };

function req(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string>; raw?: string } = {}) {
  const method = init.method ?? "POST";
  return new NextRequest(`${ORIGIN}${path}`, {
    method,
    headers: {
      host: "localhost:3000",
      origin: ORIGIN,
      "content-type": "application/json",
      "x-forwarded-for": "10.0.0.1",
      ...init.headers,
    },
    body: method === "GET" ? undefined : (init.raw ?? JSON.stringify(init.body ?? {})),
  });
}

const cookieOf = (res: Response) => res.headers.get("set-cookie")?.split(";")[0] ?? "";
const json = async (res: Response) => (await res.json()) as any;

beforeEach(async () => {
  const db = getDb();
  await db.rateLimitEvent.deleteMany();
  await db.passwordResetToken.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  devOutbox.length = 0;
});

describe("POST /api/v1/auth/register", () => {
  it("creates a real user with a hashed password, onboarding pending, and signs them in", async () => {
    const res = await register(req("/api/v1/auth/register", { body: good }));
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body.user).toMatchObject({ firstName: "Anna", lastName: "Sargsyan", email: "anna@example.com", onboardingCompleted: false });
    expect(body.user.passwordHash).toBeUndefined();

    const row = await getDb().user.findUniqueOrThrow({ where: { email: "anna@example.com" } });
    expect(row.passwordHash.startsWith("$argon2id$")).toBe(true);
    expect(row.passwordHash).not.toContain("Sunrise");
    expect(row.onboardingCompleted).toBe(false);

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);

    const me = await session(req("/api/v1/auth/session", { method: "GET", headers: { cookie: cookieOf(res) } }));
    expect(me.status).toBe(200);
    expect((await json(me)).user.email).toBe("anna@example.com");
  });

  it("stores only a hash of the session token", async () => {
    const res = await register(req("/api/v1/auth/register", { body: good }));
    const token = cookieOf(res).split("=")[1]!;
    const rows = await getDb().session.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokenHash).not.toBe(token);
  });

  it("validates on the server and returns every field error at once", async () => {
    const res = await register(req("/api/v1/auth/register", { body: { firstName: "", lastName: "Smith2", email: "nope", password: "weak" } }));
    expect(res.status).toBe(400);
    const { error } = await json(res);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(Object.keys(error.fields).sort()).toEqual(["email", "firstName", "lastName", "password"]);
    expect(error.fields.firstName).toEqual({ key: "validation.required", message: "This field is required" });
    expect(error.fields.lastName.message).toBe("Use Latin letters");
    expect(error.fields.email.message).toBe("Enter a valid email address");
    expect(await getDb().user.count()).toBe(0);
  });

  it("localizes errors from the language cookie", async () => {
    const res = await register(
      req("/api/v1/auth/register", { body: { ...good, firstName: "Աննա", email: "" }, headers: { cookie: "NEXT_LOCALE=hy" } }),
    );
    const { error } = await json(res);
    expect(error.fields.firstName.message).toBe("Լրացրեք լատինատառ");
    expect(error.fields.email.message).toBe("Լրացրեք վավեր էլհասցե");
  });

  it("rejects a duplicate email (any casing) with a neutral message", async () => {
    await register(req("/api/v1/auth/register", { body: good }));
    const res = await register(req("/api/v1/auth/register", { body: { ...good, email: "ANNA@example.com" } }));
    expect(res.status).toBe(409);
    const { error } = await json(res);
    expect(error.code).toBe("EMAIL_TAKEN");
    expect(JSON.stringify(error)).not.toMatch(/already registered|exists for/i);
    expect(await getDb().user.count()).toBe(1);
  });

  it("the database itself refuses duplicate emails", async () => {
    await register(req("/api/v1/auth/register", { body: good }));
    await expect(
      getDb().user.create({ data: { firstName: "X", lastName: "Y", email: "anna@example.com", passwordHash: "h" } }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("survives concurrent registrations of the same email (one wins)", async () => {
    const results = await Promise.all(
      [1, 2, 3].map(() => register(req("/api/v1/auth/register", { body: good }))),
    );
    expect(results.map((r) => r.status).sort()).toEqual([201, 409, 409]);
    expect(await getDb().user.count()).toBe(1);
  });

  it("rejects cross-origin requests, non-JSON bodies, malformed JSON and unknown fields", async () => {
    expect((await register(req("/api/v1/auth/register", { body: good, headers: { origin: "https://evil.example" } }))).status).toBe(403);
    expect((await register(req("/api/v1/auth/register", { body: good, headers: { "content-type": "text/plain" } }))).status).toBe(415);
    expect((await register(req("/api/v1/auth/register", { raw: "{not json" }))).status).toBe(400);
    expect((await register(req("/api/v1/auth/register", { body: { ...good, admin: true } }))).status).toBe(400);
    expect(await getDb().user.count()).toBe(0);
  });

  it("never leaks technical details when something unexpected breaks", async () => {
    const spy = vi.spyOn(getDb().user, "findUnique").mockRejectedValueOnce(new Error("SQLITE_BUSY at C:\\secret\\dev.db"));
    const res = await register(req("/api/v1/auth/register", { body: good }));
    spy.mockRestore();
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(JSON.parse(text).error.code).toBe("INTERNAL_ERROR");
    expect(text).not.toMatch(/SQLITE|secret|dev\.db|stack|prisma/i);
    expect(await getDb().user.count()).toBe(0);
  });

  it("rate-limits registrations per IP", async () => {
    const { limit } = AUTH_POLICY.limits.registerPerIp;
    await getDb().rateLimitEvent.createMany({ data: Array.from({ length: limit }, () => ({ scope: "register-ip", key: "10.0.0.1" })) });
    const res = await register(req("/api/v1/auth/register", { body: good }));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
  });
});

describe("login and logout", () => {
  beforeEach(async () => {
    await register(req("/api/v1/auth/register", { body: good }));
  });

  it("signs in with correct credentials (email case-insensitive)", async () => {
    const res = await login(req("/api/v1/auth/login", { body: { email: "Anna@Example.com", password: good.password } }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("mystbook_session=");
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    const wrong = await login(req("/api/v1/auth/login", { body: { email: good.email, password: "Wrong#Pass1" } }));
    const unknown = await login(req("/api/v1/auth/login", { body: { email: "nobody@example.com", password: "Wrong#Pass1" } }));
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await json(wrong)).toEqual(await json(unknown));
  });

  it("locks out after repeated failures, even for the right password", async () => {
    const { limit } = AUTH_POLICY.limits.loginFailuresPerEmailAndIp;
    for (let i = 0; i < limit; i++) {
      await login(req("/api/v1/auth/login", { body: { email: good.email, password: "Wrong#Pass1" } }));
    }
    const res = await login(req("/api/v1/auth/login", { body: { email: good.email, password: good.password } }));
    expect(res.status).toBe(429);
  });

  it("logout revokes the session server-side and is idempotent", async () => {
    const res = await login(req("/api/v1/auth/login", { body: { email: good.email, password: good.password } }));
    const cookie = cookieOf(res);
    const out = await logout(req("/api/v1/auth/logout", { headers: { cookie } }));
    expect(out.status).toBe(204);
    expect(out.headers.get("set-cookie")).toMatch(/Max-Age=0/);
    const me = await session(req("/api/v1/auth/session", { method: "GET", headers: { cookie } }));
    expect(me.status).toBe(401); // the old cookie no longer works
    expect((await logout(req("/api/v1/auth/logout"))).status).toBe(204);
  });

  it("rejects an anonymous session lookup", async () => {
    expect((await session(req("/api/v1/auth/session", { method: "GET" }))).status).toBe(401);
  });
});

describe("forgot and reset password", () => {
  const tokenFromEmail = () => new URL(devOutbox.at(-1)!.text.match(/https?:\/\/\S+/)![0]).searchParams.get("token")!;
  const flush = () => new Promise((r) => setTimeout(r, 50));

  beforeEach(async () => {
    await register(req("/api/v1/auth/register", { body: good }));
  });

  it("answers identically for known and unknown emails", async () => {
    const known = await forgot(req("/api/v1/auth/forgot-password", { body: { email: good.email } }));
    const unknown = await forgot(req("/api/v1/auth/forgot-password", { body: { email: "nobody@example.com" } }));
    expect(known.status).toBe(202);
    expect(unknown.status).toBe(202);
    expect(await json(known)).toEqual(await json(unknown));
    await flush();
    expect(devOutbox).toHaveLength(1); // only the real account got an email
  });

  it("resets the password with a single-use token and revokes every session", async () => {
    const signedIn = await login(req("/api/v1/auth/login", { body: { email: good.email, password: good.password } }));
    await forgot(req("/api/v1/auth/forgot-password", { body: { email: good.email } }));
    await flush();
    const token = tokenFromEmail();
    expect(await getDb().passwordResetToken.count()).toBe(1);
    expect((await getDb().passwordResetToken.findFirstOrThrow()).tokenHash).not.toBe(token);

    const ok = await reset(req("/api/v1/auth/reset-password", { body: { token, newPassword: "NewSunrise#7" } }));
    expect(ok.status).toBe(200);

    const again = await reset(req("/api/v1/auth/reset-password", { body: { token, newPassword: "Another#Pass9" } }));
    expect(again.status).toBe(400);
    expect((await json(again)).error.code).toBe("TOKEN_INVALID_OR_EXPIRED");

    const me = await session(req("/api/v1/auth/session", { method: "GET", headers: { cookie: cookieOf(signedIn) } }));
    expect(me.status).toBe(401);

    const oldPw = await login(req("/api/v1/auth/login", { body: { email: good.email, password: good.password } }));
    expect(oldPw.status).toBe(401);
    const newPw = await login(req("/api/v1/auth/login", { body: { email: good.email, password: "NewSunrise#7" } }));
    expect(newPw.status).toBe(200);
  });

  it("enforces the password policy on reset and rejects bad or expired tokens", async () => {
    await forgot(req("/api/v1/auth/forgot-password", { body: { email: good.email } }));
    await flush();
    const token = tokenFromEmail();

    const weak = await reset(req("/api/v1/auth/reset-password", { body: { token, newPassword: "weak" } }));
    expect(weak.status).toBe(400);
    expect((await json(weak)).error.fields.newPassword.key).toBe("validation.passwordRules");

    const bogus = await reset(req("/api/v1/auth/reset-password", { body: { token: "x".repeat(43), newPassword: "NewSunrise#7" } }));
    expect(bogus.status).toBe(400);

    await getDb().passwordResetToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    const expired = await reset(req("/api/v1/auth/reset-password", { body: { token, newPassword: "NewSunrise#7" } }));
    expect((await json(expired)).error.code).toBe("TOKEN_INVALID_OR_EXPIRED");
  });

  it("sends the reset email in the request language", async () => {
    await forgot(req("/api/v1/auth/forgot-password", { body: { email: good.email }, headers: { cookie: "NEXT_LOCALE=hy" } }));
    await flush();
    expect(devOutbox.at(-1)!.subject).toContain("գաղտնաբառի վերականգնում");
  });
});
