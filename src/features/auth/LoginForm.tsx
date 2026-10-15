"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { rearmBookIntro } from "@/lib/book-intro";
import { loginSchema } from "@/shared/validation/auth";
import { homePathFor, ROUTES, safeNext } from "@/shared/routes";
import { Button } from "@/ui/Button";
import { FormAlert } from "@/ui/FormAlert";
import { PasswordField } from "@/ui/PasswordField";
import { TextField } from "@/ui/TextField";
import { TextLink } from "@/ui/TextLink";
import { authApi } from "./api";
import { useSchemaForm } from "@/lib/forms/useSchemaForm";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";

export function LoginForm({ next }: { next?: string | null }) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const tk = useTranslateKey();
  const router = useRouter();

  const form = useSchemaForm({
    schema: loginSchema,
    initialValues: { email: "", password: "" },
    clearOnError: ["password"],
    onSubmit: async (data) => {
      const { user } = await authApi.login(data);
      rearmBookIntro();
      router.replace(safeNext(next) ?? homePathFor(user));
    },
  });

  return (
    <form
      method="post"
      ref={form.formRef}
      onSubmit={form.handleSubmit}
      noValidate
      aria-busy={form.status === "submitting"}
      className={`flex flex-col gap-5 transition-opacity duration-300 ${form.status === "success" ? "pointer-events-none opacity-70" : ""}`}
    >
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

      <div>
        <PasswordField label={t("fields.password.label")} autoComplete="current-password" {...form.field("password")} error={tk(form.errorKey("password"))} />
        <p className="mt-2.5 text-right text-[0.9375rem]">
          <TextLink href={ROUTES.forgotPassword}>{t("login.forgot")}</TextLink>
        </p>
      </div>

      <Button type="submit" block state={form.status === "submitting" ? "loading" : "idle"}>
        {t("login.submit")}
      </Button>

      <p className="text-center text-[0.9375rem] text-muted">
        {t("login.noAccount")} <TextLink href={ROUTES.register}>{t("login.createAccount")}</TextLink>
      </p>
    </form>
  );
}
