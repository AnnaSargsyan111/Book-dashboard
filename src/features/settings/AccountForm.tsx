"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ApiRequestError, isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { updateAccountSchema, type UpdateAccountInput } from "@/shared/validation/account";
import { Button, type ButtonState } from "@/ui/Button";
import { FormAlert } from "@/ui/FormAlert";
import { TextField } from "@/ui/TextField";
import { useToast } from "@/ui/toast/ToastProvider";
import { settingsApi } from "./api";

type Field = keyof UpdateAccountInput;
type SaveStatus = "idle" | "saving" | "success";
const SUCCESS_FLASH_MS = 1400;

/**
 * Account Details: First/Last Name are editable; Email is fixed (shown, never sent). Same dirty-tracked Save
 * pattern as the About Me page — the button reflects whether anything actually changed since the last save.
 */
export function AccountForm({ initial, email }: { initial: UpdateAccountInput; email: string }) {
  const t = useTranslations("settings.account");
  const ta = useTranslations("auth.fields");
  const tc = useTranslations("common");
  const tk = useTranslateKey();
  const router = useRouter();
  const { show: showToast } = useToast();

  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [formError, setFormError] = useState<ApiRequestError | null>(null);
  const inFlight = useRef(false);

  const dirty = values.firstName !== saved.firstName || values.lastName !== saved.lastName;

  const schemaErrors = useMemo(() => {
    const result = updateAccountSchema.safeParse(values);
    return result.success ? {} : fieldErrorKeys(result.error);
  }, [values]);

  function setField(name: Field, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSave() {
    if (!dirty || inFlight.current) return;
    const parsed = updateAccountSchema.safeParse(values);
    if (!parsed.success) {
      setTouched({ firstName: true, lastName: true });
      return;
    }

    inFlight.current = true;
    setStatus("saving");
    setFormError(null);
    try {
      const { user } = await settingsApi.updateAccount(parsed.data);
      const next = { firstName: user.firstName, lastName: user.lastName };
      setSaved(next);
      setValues(next);
      setTouched({});
      setStatus("success");
      showToast(t("toast"));
      router.refresh(); // the header's initials and name are server-rendered; this repaints them from the new data
      setTimeout(() => setStatus((s) => (s === "success" ? "idle" : s)), SUCCESS_FLASH_MS);
    } catch (error) {
      setStatus("idle");
      if (isApiRequestError(error)) setFormError(error);
      else throw error;
    } finally {
      inFlight.current = false;
    }
  }

  const buttonState: ButtonState = status === "saving" ? "loading" : status === "success" ? "success" : "idle";

  return (
    <div className="mt-7 flex flex-col gap-5">
      <FormAlert
        action={
          formError?.code === "NETWORK" ? (
            <button type="button" onClick={handleSave} className="underline underline-offset-4">
              {tc("retry")}
            </button>
          ) : null
        }
      >
        {formError ? tk(formError.messageKey) : null}
      </FormAlert>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label={ta("firstName.label")}
          autoComplete="given-name"
          value={values.firstName}
          onChange={(e) => setField("firstName", e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, firstName: false }))}
          error={touched.firstName ? tk(schemaErrors.firstName) : undefined}
        />
        <TextField
          label={ta("lastName.label")}
          autoComplete="family-name"
          value={values.lastName}
          onChange={(e) => setField("lastName", e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, lastName: false }))}
          error={touched.lastName ? tk(schemaErrors.lastName) : undefined}
        />
      </div>

      <TextField label={ta("email.label")} type="email" value={email} readOnly hint={t("emailHint")} />

      <div>
        <Button onClick={handleSave} disabled={!dirty} state={buttonState} loadingLabel={t("saving")} successLabel={t("saved")}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
