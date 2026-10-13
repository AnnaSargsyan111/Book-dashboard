"use client";

import { MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { forgotPasswordSchema } from "@/shared/validation/auth";
import { ROUTES } from "@/shared/routes";
import { Button } from "@/ui/Button";
import { FormAlert } from "@/ui/FormAlert";
import { StatusPanel } from "@/ui/StatusPanel";
import { TextField } from "@/ui/TextField";
import { TextLink } from "@/ui/TextLink";
import { authApi } from "./api";
import { useSchemaForm } from "@/lib/forms/useSchemaForm";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const tk = useTranslateKey();

  const form = useSchemaForm({
    schema: forgotPasswordSchema,
    initialValues: { email: "" },
    onSubmit: async (data) => {
      await authApi.forgotPassword(data);
    },
  });

  // The same confirmation appears whether or not the address belongs to an account.
  if (form.status === "success") {
    return (
      <StatusPanel
        icon={MailCheck}
        title={t("forgot.sentTitle")}
        action={<TextLink href={ROUTES.login}>{t("forgot.back")}</TextLink>}
      >
        {t("forgot.sentBody")}
      </StatusPanel>
    );
  }

  return (
    <form method="post" ref={form.formRef} onSubmit={form.handleSubmit} noValidate aria-busy={form.status === "submitting"} className="flex flex-col gap-5">
      <FormAlert
        action={
          form.formError?.code === "NETWORK" ? (
            <button type="button" onClick={form.retry} className="underline underline-offset-4">
              {tc("retry")}
            </button>
          ) : null
        }
      >
        {tk(form.formError?.messageKey)}
      </FormAlert>

      <TextField
        label={t("fields.email.label")}
        placeholder={t("fields.email.placeholder")}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        {...form.field("email")}
        error={tk(form.errorKey("email"))}
      />

      <Button type="submit" block arrow state={form.status === "submitting" ? "loading" : "idle"} loadingLabel={t("forgot.submitting")}>
        {t("forgot.submit")}
      </Button>

      <p className="text-center text-[0.9375rem]">
        <TextLink href={ROUTES.login}>{t("forgot.back")}</TextLink>
      </p>
    </form>
  );
}
