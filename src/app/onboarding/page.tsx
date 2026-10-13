import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { OnboardingForm } from "@/features/onboarding/OnboardingForm";
import { requireUser } from "@/server/modules/auth/guards";
import { ROUTES } from "@/shared/routes";
import { AuthShell } from "@/ui/AuthShell";
import { Heading } from "@/ui/Heading";
import { richMark } from "@/ui/rich";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("onboarding") };
}

/**
 * Mandatory gate, shown after registration (and after any login) until it is completed. Once the user has
 * continued, this page is never shown again: a completed user is sent straight to the app's hub page.
 */
export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingCompleted) redirect(ROUTES.home);
  const t = await getTranslations("onboarding");

  return (
    <AuthShell wide>
      <div className="animate-rise">
        <p className="onboarding-eyebrow mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted">{t("eyebrow")}</p>
        <Heading title={t.rich("title", richMark)} subtitle={t("subtitle")} className="onboarding-heading" />
        <OnboardingForm />
        <p className="onboarding-exit mt-7 text-center">
          <SignOutButton quiet />
        </p>
      </div>
    </AuthShell>
  );
}
