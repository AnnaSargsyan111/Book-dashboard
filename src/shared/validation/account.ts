import { z } from "zod";
import { nameField, newPasswordField } from "./auth";
import { VALIDATION_KEYS as K } from "./keys";

/** Settings' Account Details form: First/Last Name only. Email is never editable here (unknown fields, including
 *  `email`, are rejected by `.strict()`), exactly like onboarding never touches the name. */
export const updateAccountSchema = z.object({ firstName: nameField, lastName: nameField }).strict();
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

/**
 * Settings' Change Password: New Password (the same composition policy as everywhere else) + Confirm Password.
 * There is deliberately no `currentPassword` field — any authenticated session for the account may change the
 * password unilaterally. On success every OTHER session is revoked; this one stays signed in.
 */
export const changePasswordSchema = z
  .object({ newPassword: newPasswordField, confirmPassword: z.string({ error: K.required }).min(1, { error: K.required, abort: true }) })
  .strict()
  .refine((v) => v.newPassword === v.confirmPassword, { error: K.passwordMismatch, path: ["confirmPassword"] });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
