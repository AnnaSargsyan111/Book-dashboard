import { describe, expect, it } from "vitest";
import { catalogs } from "@/i18n/messages";
import { fieldErrorKeys, registerSchema } from "@/shared/validation/auth";
import { checkPassword } from "@/shared/validation/password-rules";
import { VALIDATION_KEYS } from "@/shared/validation/keys";

const valid = { firstName: "Anna", lastName: "Sargsyan", email: "Anna@Example.com ", password: "Sunrise#2026" };

function errorsFor(input: unknown) {
  const result = registerSchema.safeParse(input);
  return result.success ? {} : fieldErrorKeys(result.error);
}

describe("register schema", () => {
  it("accepts valid input and normalizes it", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("anna@example.com");
  });

  it("reports every empty field at once, as keys", () => {
    expect(errorsFor({ firstName: "", lastName: "  ", email: "", password: "" })).toEqual({
      firstName: "validation.required",
      lastName: "validation.required",
      email: "validation.invalidEmail",
      password: "validation.required",
    });
  });

  it("requires Latin letters in names", () => {
    expect(errorsFor({ ...valid, firstName: "Աննա" }).firstName).toBe("validation.latinOnly");
    expect(errorsFor({ ...valid, lastName: "Smith2" }).lastName).toBe("validation.latinOnly");
    expect(errorsFor({ ...valid, firstName: "Mary-Jane" }).firstName).toBeUndefined();
    expect(errorsFor({ ...valid, lastName: "O'Brien" }).lastName).toBeUndefined();
  });

  it("rejects malformed emails", () => {
    for (const email of ["nope", "a@b", "a b@c.com", "@x.com"]) {
      expect(errorsFor({ ...valid, email }).email, email).toBe("validation.invalidEmail");
    }
  });

  it("rejects unknown fields", () => {
    expect(registerSchema.safeParse({ ...valid, role: "admin" }).success).toBe(false);
  });
});

describe("password policy", () => {
  const ok = (p: string) => checkPassword(p).valid;
  it("enforces length, uppercase, lowercase, number and special character", () => {
    expect(ok("Sunrise#2026")).toBe(true);
    expect(ok("Short#1")).toBe(false); // 7 chars
    expect(ok("A".repeat(20) + "#1" + "a".repeat(11))).toBe(false); // 33 chars
    expect(ok("sunrise#2026")).toBe(false); // no uppercase
    expect(ok("SUNRISE#2026")).toBe(false); // no lowercase
    expect(ok("Sunrise#Sunrise")).toBe(false); // no number
    expect(ok("Sunrise2026")).toBe(false); // no special
    expect(ok("12345678Aa")).toBe(false);
  });

  it("accepts exactly 8 and exactly 32 characters", () => {
    expect(ok("Abcdef#1")).toBe(true);
    expect(ok("Abcdefghijklmnopqrstuvwxyz#12345")).toBe(true); // 32
    expect(ok("Abcdefghijklmnopqrstuvwxyz#123456")).toBe(false); // 33
  });

  it("surfaces the aggregate key when a non-empty password fails", () => {
    expect(errorsFor({ ...valid, password: "weak" }).password).toBe(VALIDATION_KEYS.passwordRules);
  });
});

describe("message catalogs", () => {
  const flatten = (o: Record<string, unknown>, prefix = ""): string[] =>
    Object.entries(o).flatMap(([k, v]) =>
      typeof v === "object" && v !== null ? flatten(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
    );

  it("English and Armenian define exactly the same keys", () => {
    expect(flatten(catalogs.hy).sort()).toEqual(flatten(catalogs.en).sort());
  });

  it("uses the specified wording for the required validation messages", () => {
    expect(catalogs.en.validation.required).toBe("This field is required");
    expect(catalogs.hy.validation.required).toBe("Պարտադիր լրացման դաշտ");
    expect(catalogs.en.validation.latinOnly).toBe("Use Latin letters");
    expect(catalogs.hy.validation.latinOnly).toBe("Լրացրեք լատինատառ");
    expect(catalogs.en.validation.invalidEmail).toBe("Enter a valid email address");
    expect(catalogs.hy.validation.invalidEmail).toBe("Լրացրեք վավեր էլհասցե");
  });

  it("every validation key emitted by the schemas exists in every catalog", () => {
    for (const key of Object.values(VALIDATION_KEYS)) {
      const name = key.replace("validation.", "");
      expect(catalogs.en.validation).toHaveProperty(name);
      expect(catalogs.hy.validation).toHaveProperty(name);
    }
  });
});
