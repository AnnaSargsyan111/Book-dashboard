import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";
import { Heading } from "@/ui/Heading";
import { richMark } from "@/ui/rich";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("resetPassword") };
}

/** Deliberately not redirected for signed-in users: the emailed link must work whatever the current session is. */
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const [{ token }, t] = await Promise.all([searchParams, getTranslations("auth.reset")]);

  return (
    <>
      <Heading title={t.rich("title", richMark)} subtitle={t("subtitle")} />
      <ResetPasswordForm token={token} />
    </>
  );
}
