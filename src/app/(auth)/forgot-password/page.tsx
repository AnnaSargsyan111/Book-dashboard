import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";
import { redirectIfSignedIn } from "@/server/modules/auth/guards";
import { Heading } from "@/ui/Heading";
import { richMark } from "@/ui/rich";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("forgotPassword") };
}

export default async function ForgotPasswordPage() {
  await redirectIfSignedIn();
  const t = await getTranslations("auth.forgot");

  return (
    <>
      <Heading title={t.rich("title", richMark)} subtitle={t("subtitle")} />
      <ForgotPasswordForm />
    </>
  );
}
