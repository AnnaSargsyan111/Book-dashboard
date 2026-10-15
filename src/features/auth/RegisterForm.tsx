"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/shared/validation/auth";
import { homePathFor, ROUTES } from "@/shared/routes";
import { Button } from "@/ui/Button";
import { FormAlert } from "@/ui/FormAlert";
import { PasswordField } from "@/ui/PasswordField";
import { PasswordRequirements } from "@/ui/PasswordRequirements";
import { TextField } from "@/ui/TextField";
import { TextLink } from "@/ui/TextLink";
import { rearmBookIntro } from "@/lib/book-intro";
import { authApi } from "./api";
import { useSchemaForm } from "@/lib/forms/useSchemaForm";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const tk = useTranslateKey();
  const router = useRouter();

  const form = useSchemaForm({
    schema: registerSchema,
    initialValues: { firstName: "", lastName: "", email: "", password: "" },
    clearOnError: ["password"],
    onSubmit: async (data) => {
      const { user } = await authApi.register(data);
      rearmBookIntro(user.firstName);
      router.replace(homePathFor(user));
    },
  });

  const errorCode = form.formError?.code;

  return (
    <form
      method="post"
      ref={form.formRef}
      onSubmit={form.handleSubmit}
      noValidate
      aria-busy={form.status === "submitting"}
      className={`register-form flex flex-col gap-5 transition-opacity duration-300 ${form.status === "success" ? "pointer-events-none opacity-70" : ""}`}
    >
      <FormAlert
        action={
          errorCode === "EMAIL_TAKEN" ? (
            <>
              <TextLink href={ROUTES.login}>{t("register.signIn")}</TextLink>
              <TextLink href={ROUTES.forgotPassword}>{t("login.forgot")}</TextLink>
            </>
          ) : errorCode === "NETWORK" ? (
            <button type="button" onClick={form.retry} className="underline underline-offset-4">
              {tc("retry")}
            </button>
          ) : null
        }
      >
        {tk(form.formError?.messageKey)}
      </FormAlert>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label={t("fields.firstName.label")}
          placeholder={t("fields.firstName.placeholder")}
          autoComplete="given-name"
          autoCapitalize="words"
          {...form.field("firstName")}
          error={tk(form.errorKey("firstName"))}
        />
        <TextField
          label={t("fields.lastName.label")}
          placeholder={t("fields.lastName.placeholder")}
          autoComplete="family-name"
          autoCapitalize="words"
          {...form.field("lastName")}
          error={tk(form.errorKey("lastName"))}
        />
      </div>

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

      <div className="register-password flex flex-col gap-3">
        <PasswordField
          label={t("fields.password.label")}
          autoComplete="new-password"
          describedBy="password-requirements"
          {...form.field("password")}
          error={tk(form.errorKey("password"))}
        />
        <PasswordRequirements id="password-requirements" password={form.values.password} showErrors={form.submitted} />
      </div>

      <Button type="submit" block state={form.status === "submitting" ? "loading" : "idle"} className="mt-1">
        {t("register.submit")}
      </Button>

      <p className="text-center text-[0.9375rem] text-muted">
        {t("register.hasAccount")} <TextLink href={ROUTES.login}>{t("register.signIn")}</TextLink>
      </p>
    </form>
  );
}
