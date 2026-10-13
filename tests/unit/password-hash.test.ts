import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/security/password";
import { generateToken, hashToken } from "@/server/security/tokens";

describe("password hashing", () => {
  it("produces a salted Argon2id hash, never the plain password", async () => {
    const a = await hashPassword("Sunrise#2026");
    const b = await hashPassword("Sunrise#2026");
    expect(a.startsWith("$argon2id$")).toBe(true);
    expect(a).not.toContain("Sunrise");
    expect(a).not.toBe(b); // unique salt each time
  });

  it("verifies the right password and rejects the wrong one", async () => {
    const hash = await hashPassword("Sunrise#2026");
    expect(await verifyPassword(hash, "Sunrise#2026")).toBe(true);
    expect(await verifyPassword(hash, "Sunrise#2027")).toBe(false);
    expect(await verifyPassword("not-a-hash", "Sunrise#2026")).toBe(false);
  });
});

describe("tokens", () => {
  it("are long, unique and stored only as hashes", () => {
    const t1 = generateToken();
    const t2 = generateToken();
    expect(t1).not.toBe(t2);
    expect(t1.length).toBeGreaterThanOrEqual(43);
    expect(hashToken(t1)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(t1)).not.toBe(t1);
  });
});
