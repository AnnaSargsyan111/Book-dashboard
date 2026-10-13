import { LIMITS } from "./limits";

export type PasswordRuleId = "length" | "uppercase" | "lowercase" | "number" | "special";

export interface PasswordRule {
  id: PasswordRuleId;
  test: (password: string) => boolean;
}

/** Number of characters as a person counts them (an emoji is one, not two UTF-16 units). */
export const passwordLength = (password: string) => [...password].length;

/**
 * The password policy. The live checklist in the UI and the server-side schema both read THIS list, so what the
 * user sees ticked is exactly what the API enforces. Labels live in the message catalogs (`passwordRules.<id>`).
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    test: (p) => passwordLength(p) >= LIMITS.passwordMin && passwordLength(p) <= LIMITS.passwordMax,
  },
  { id: "uppercase", test: (p) => /\p{Lu}/u.test(p) },
  { id: "lowercase", test: (p) => /\p{Ll}/u.test(p) },
  { id: "number", test: (p) => /\p{N}/u.test(p) },
  // special = anything that is not a letter, number or whitespace
  { id: "special", test: (p) => /[^\p{L}\p{N}\s]/u.test(p) },
];

export interface PasswordRuleResult {
  id: PasswordRuleId;
  ok: boolean;
}

export function checkPassword(password: string): { valid: boolean; results: PasswordRuleResult[] } {
  const results = PASSWORD_RULES.map((rule) => ({ id: rule.id, ok: rule.test(password) }));
  return { valid: results.every((r) => r.ok), results };
}
