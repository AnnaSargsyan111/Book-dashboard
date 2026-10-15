"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { changePasswordSchema } from "@/shared/validation/account";
import { VALIDATION_KEYS } from "@/shared/validation/keys";
import { Button } from "@/ui/Button";
import { FormAlert } from "@/ui/FormAlert";
import { PasswordField } from "@/ui/PasswordField";
import { PasswordRequirements } from "@/ui/PasswordRequirements";
import { useToast } from "@/ui/toast/ToastProvider";
import { settingsApi } from "./api";

/**
 * New Password (with the live checklist) + Confirm Password, no Current Password field (see `changePassword()` on
 * the server for the documented reasoning). A click is always live; it only ever blocks on an empty field or the
 * two values not matching yet — both already visible before the click (the checklist, and the mismatch message
 * under Confirm Password), so nothing new appears that the person hasn't already seen.
 */
export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("settings.security");
  const tf = useTranslations("auth.fields");
  const tc = useTranslations("common");
  const tk = useTranslateKey();
  const { show: showToast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<{ newPassword?: boolean; confirmPassword?: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schemaErrors = (() => {
    const result = changePasswordSchema.safeParse({ newPassword, confirmPassword });
    return result.success ? {} : fieldErrorKeys(result.error);
  })();
  // Live, independent of any submit attempt (matches the checklist's own always-live feedback).
  const mismatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    if (busy) return;
    setSubmitted(true);
    const parsed = changePasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      setTouched({ newPassword: true, confirmPassword: true });
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      await settingsApi.changePassword(parsed.data);
      showToast(t("passwordToast"));
      onClose();
    } catch (error) {
      setNewPassword("");
      setConfirmPassword("");
      setSubmitted(false);
      setTouched({});
      if (isApiRequestError(error)) setFormError(tk(error.messageKey) ?? null);
      else throw error;
    } finally {
      setBusy(false);
    }
  }

  const confirmErrorKey = touched.confirmPassword ? schemaErrors.confirmPassword : undefined;

  return (
    <div role="presentation" className="welcome-backdrop fixed inset-0 z-[80] flex items-center justify-center p-5" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        tabIndex={-1}
        className="welcome-panel relative w-full max-w-[28rem] rounded-[1.75rem] bg-surface p-7 shadow-[0_50px_100px_-30px_rgb(0_0_0/0.55)] outline-none sm:p-9"
      >
        <button
          type="button"
          onClick={() => !busy && onClose()}
          aria-label={tc("close")}
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          <X className="size-[1.125rem]" aria-hidden="true" />
        </button>

        <h2 id="change-password-title" className="max-w-[16ch] font-display text-[1.5rem] leading-tight">
          {t("modalTitle")}
        </h2>

        <div className="mt-6 flex flex-col gap-5">
          <FormAlert>{formError}</FormAlert>

          <div className="flex flex-col gap-3">
            <PasswordField
              autoFocus
              label={tf("newPassword.label")}
              autoComplete="new-password"
              describedBy="change-password-requirements"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setTouched((p) => ({ ...p, newPassword: false }));
              }}
              onBlur={() => setTouched((p) => ({ ...p, newPassword: false }))}
              error={touched.newPassword ? tk(schemaErrors.newPassword) : undefined}
            />
            <PasswordRequirements id="change-password-requirements" password={newPassword} showErrors={submitted} />
          </div>

          <PasswordField
            label={tf("confirmPassword.label")}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setTouched((p) => ({ ...p, confirmPassword: false }));
            }}
            onBlur={() => setTouched((p) => ({ ...p, confirmPassword: false }))}
            error={tk(confirmErrorKey ?? (mismatch ? VALIDATION_KEYS.passwordMismatch : undefined))}
          />

          <div className="mt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={() => !busy && onClose()} className="rounded-lg px-3 py-2.5 text-[0.9375rem] font-medium text-ink-2 transition-colors hover:text-ink">
              {tc("cancel")}
            </button>
            <Button onClick={submit} state={busy ? "loading" : "idle"}>
              {t("save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
