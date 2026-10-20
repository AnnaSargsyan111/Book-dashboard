import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountForm } from "@/features/settings/AccountForm";
import { SecuritySection } from "@/features/settings/SecuritySection";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { AppFrame } from "@/ui/AppFrame";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("settings") };
}

/**
 * Settings, as an open book, the same two-page spread as Thoughts (`.book-frame`/`.book-grain`/`.book-spine`):
 * the left page is Account (who's signed in, Profile's First/Last Name form), the right page is Security
 * (Change Password, Sign Out). Both pages already carried real content before this redesign — unlike Thoughts,
 * there's no empty state and no editorial intro to write; this only replaces the old bordered-card-plus-photo-hero
 * layout with the book itself, so `AppFrame` no longer floats its header for this scene (see the `floatHeader`
 * comment there) since there's no edge-to-edge photo left to float over.
 */
export default async function SettingsPage() {
  const user = await requireOnboardedUser();
  const t = await getTranslations("settings");
  const ta = await getTranslations("settings.account");
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <AppFrame user={user} scene="settings" alignTop>
      <div className="-mt-6 max-w-5xl sm:-mt-14 lg:-mb-12 lg:ml-6 lg:mt-[3.7rem]">
        <div className="book-frame relative grid gap-0 lg:grid-cols-2">
          <div className="book-grain" aria-hidden="true" />
          <div className="book-spine hidden lg:block" aria-hidden="true" />

          <div className="relative flex flex-col px-8 py-10 sm:px-12 sm:py-14 lg:py-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{t("eyebrow")}</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-[1.08] tracking-[-0.01em] text-ink">{t("title")}</h1>
            <p className="mt-3 max-w-[38ch] text-[0.9375rem] leading-relaxed text-muted">{t("subtitle")}</p>

            <div className="mt-8 flex items-center gap-4 lg:mt-5">
              <span className="seal grid size-12 shrink-0 place-items-center rounded-full border border-rule-strong font-display text-base font-medium tracking-wide text-ink">{initials}</span>
              <div className="min-w-0">
                <p className="truncate text-[1.0625rem] font-medium text-ink">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-sm text-muted">{user.email}</p>
              </div>
            </div>

            <p className="mt-9 text-xs font-medium uppercase tracking-[0.14em] text-muted lg:mt-6">{ta("eyebrow")}</p>
            <h2 className="mt-1 font-display text-xl">{ta("title")}</h2>
            <AccountForm initial={{ firstName: user.firstName, lastName: user.lastName }} email={user.email} />
          </div>

          <div className="relative flex flex-col px-8 py-10 sm:px-12 sm:py-14 lg:py-8">
            <SecuritySection />
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
