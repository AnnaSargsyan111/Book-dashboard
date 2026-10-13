"use client";

import { CircleCheck, LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { resetPasswordSchema } from "@/shared/validation/auth";
import { ROUTES } from "@/shared/routes";
import { Button } from "@/ui/Button";
import { FormAlert } from "@/ui/FormAlert";
import { PasswordField } from "@/ui/PasswordField";
import { PasswordRequirements } from "@/ui/PasswordRequirements";
import { StatusPanel } from "@/ui/StatusPanel";
import { TextLink } from "@/ui/TextLink";
import { authApi } from "./api";
import { useSchemaForm } from "@/lib/forms/useSchemaForm";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";

const formSchema = resetPasswordSchema.pick({ newPassword: true });

export function ResetPasswordForm({ token }: { token?: string }) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const tk = useTranslateKey();

  const form = useSchemaForm({
    schema: formSchema,
    initialValues: { newPassword: "" },
    clearOnError: ["newPassword"],
    onSubmit: async (data) => {
      await authApi.resetPassword({ token: token ?? "", newPassword: data.newPassword });
    },
  });

  // Opened without the emailed link's token.
  if (!token) {
    return (
      <StatusPanel icon={LinkIcon} title={t("reset.missingTitle")} action={<TextLink href={ROUTES.forgotPassword}>{t("reset.requestNew")}</TextLink>}>
        {t("reset.missingBody")}
      </StatusPanel>
    );
  }

  if (form.status === "success") {
    return (
      <StatusPanel icon={CircleCheck} title={t("reset.doneTitle")} action={<TextLink href={ROUTES.login}>{t("reset.toLogin")}</TextLink>}>
        {t("reset.doneBody")}
      </StatusPanel>
    );
  }

  const errorCode = form.formError?.code;

  return (
    <form method="post" ref={form.formRef} onSubmit={form.handleSubmit} noValidate aria-busy={form.status === "submitting"} className="flex flex-col gap-5">
      <FormAlert
        action={
          errorCode === "TOKEN_INVALID_OR_EXPIRED" ? (
            <TextLink href={ROUTES.forgotPassword}>{t("reset.requestNew")}</TextLink>
          ) : errorCode === "NETWORK" ? (
            <button type="button" onClick={form.retry} className="underline underline-offset-4">
              {tc("retry")}
            </button>
          ) : null
        }
      >
        {tk(form.formError?.messageKey)}
      </FormAlert>

      <div className="flex flex-col gap-3">
        <PasswordField
          label={t("fields.newPassword.label")}
          autoComplete="new-password"
          describedBy="password-requirements"
          {...form.field("newPassword")}
          error={tk(form.errorKey("newPassword"))}
        />
        <PasswordRequirements id="password-requirements" password={form.values.newPassword} showErrors={form.submitted} />
      </div>

      <Button type="submit" block arrow state={form.status === "submitting" ? "loading" : "idle"} loadingLabel={t("reset.submitting")}>
        {t("reset.submit")}
      </Button>

      <p className="text-center text-[0.9375rem]">
        <TextLink href={ROUTES.login}>{t("forgot.back")}</TextLink>
      </p>
    </form>
  );
}
