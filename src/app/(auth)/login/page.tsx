import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/features/auth/LoginForm";
import { redirectIfSignedIn } from "@/server/modules/auth/guards";
import { Heading } from "@/ui/Heading";
import { richMark } from "@/ui/rich";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("login") };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await redirectIfSignedIn();
  const [{ next }, t] = await Promise.all([searchParams, getTranslations("auth.login")]);

  return (
    <>
      <Heading title={t.rich("title", richMark)} />
      <LoginForm next={next} />
    </>
  );
}
