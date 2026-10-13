import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { redirectIfSignedIn } from "@/server/modules/auth/guards";
import { Heading } from "@/ui/Heading";
import { richMark } from "@/ui/rich";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("register") };
}

export default async function RegisterPage() {
  await redirectIfSignedIn();
  const t = await getTranslations("auth.register");

  return (
    <>
      <Heading title={t.rich("title", richMark)} className="register-heading" />
      <RegisterForm />
    </>
  );
}
