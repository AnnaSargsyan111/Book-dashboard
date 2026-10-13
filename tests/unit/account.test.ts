import { describe, expect, it } from "vitest";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { changePasswordSchema, updateAccountSchema } from "@/shared/validation/account";

describe("update account schema (Settings' Account Details)", () => {
  it("accepts First/Last Name", () => {
    expect(updateAccountSchema.safeParse({ firstName: "Jane", lastName: "Austen" }).success).toBe(true);
  });

  it("still requires Latin letters, like registration", () => {
    const result = updateAccountSchema.safeParse({ firstName: "Ջեյն", lastName: "Austen" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorKeys(result.error).firstName).toBe("validation.latinOnly");
  });

  it("rejects email (or any other field) — it is never editable here", () => {
    expect(updateAccountSchema.safeParse({ firstName: "Jane", lastName: "Austen", email: "x@y.com" }).success).toBe(false);
  });
});

describe("change password schema (Settings' Change Password)", () => {
  const strong = "Sunrise#2026";

  it("accepts a strong password when both fields match", () => {
    expect(changePasswordSchema.safeParse({ newPassword: strong, confirmPassword: strong }).success).toBe(true);
  });

  it("flags a mismatch on confirmPassword specifically", () => {
    const result = changePasswordSchema.safeParse({ newPassword: strong, confirmPassword: "Different#2026" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorKeys(result.error).confirmPassword).toBe("validation.passwordMismatch");
  });

  it("still enforces the shared password policy on newPassword", () => {
    const result = changePasswordSchema.safeParse({ newPassword: "weak", confirmPassword: "weak" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorKeys(result.error).newPassword).toBe("validation.passwordRules");
  });

  it("requires confirmPassword to be present", () => {
    const result = changePasswordSchema.safeParse({ newPassword: strong, confirmPassword: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorKeys(result.error).confirmPassword).toBe("validation.required");
  });

  it("has no currentPassword field — an extra field is rejected (unknown, not silently ignored)", () => {
    expect(changePasswordSchema.safeParse({ newPassword: strong, confirmPassword: strong, currentPassword: "whatever" }).success).toBe(false);
  });
});
