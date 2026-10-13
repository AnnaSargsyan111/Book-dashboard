import { z } from "zod";
import { LIMITS } from "./limits";
import { VALIDATION_KEYS as K } from "./keys";
import { checkPassword } from "./password-rules";

/**
 * Latin letters only. A single space, hyphen or apostrophe between letters is tolerated so real names such as
 * "Mary-Jane" or "O'Brien" are not rejected; digits, other scripts and stray symbols are.
 */
const LATIN_NAME = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

export const nameField = z
  .string({ error: K.required })
  .trim()
  .min(1, { error: K.required, abort: true })
  .max(LIMITS.nameMax, { error: K.nameTooLong, abort: true })
  .regex(LATIN_NAME, { error: K.latinOnly });

/** Empty and malformed both read "Enter a valid email address". */
export const emailField = z
  .string({ error: K.invalidEmail })
  .trim()
  .toLowerCase()
  .min(1, { error: K.invalidEmail, abort: true })
  .max(LIMITS.emailMax, { error: K.invalidEmail, abort: true })
  .pipe(z.email({ error: K.invalidEmail }));

/** New password (registration + reset): required, then every rule of the shared policy. */
export const newPasswordField = z
  .string({ error: K.required })
  .min(1, { error: K.required, abort: true })
  .refine((p) => checkPassword(p).valid, { error: K.passwordRules });

/** Existing password (login): presence only. Never reveal the policy to someone guessing. */
const existingPasswordField = z
  .string({ error: K.required })
  .min(1, { error: K.required, abort: true })
  .max(1024, { error: K.required });

// `.strict()` everywhere: unknown fields are rejected, not silently ignored.
export const registerSchema = z
  .object({ firstName: nameField, lastName: nameField, email: emailField, password: newPasswordField })
  .strict();

export const loginSchema = z.object({ email: emailField, password: existingPasswordField }).strict();

export const forgotPasswordSchema = z.object({ email: emailField }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(LIMITS.tokenMin).max(LIMITS.tokenMax),
    newPassword: newPasswordField,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * First issue per field, as a validation key. Used identically by the browser form and the API. Issues that did not
 * come from our own rules (an unknown key, a malformed token) carry no key and are left out.
 */
export function fieldErrorKeys(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || field in out || !issue.message.startsWith("validation.")) continue;
    out[field] = issue.message;
  }
  return out;
}
