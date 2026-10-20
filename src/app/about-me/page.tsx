import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AboutMeForm } from "@/features/profile/AboutMeForm";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { findProfile } from "@/server/modules/profile/profile.repository";
import { AppFrame } from "@/ui/AppFrame";
import { BotanicalBranch } from "@/ui/scenes/BotanicalBranch";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("aboutMe") };
}

/**
 * About Me, as an open book, the same two-page spread as Thoughts and Settings (`.book-frame`/`.book-grain`/
 * `.book-spine`): the left page is the real, editable literary profile (`AboutMeForm` — Genre, Favorite Authors,
 * About Me itself, every field still fully clearable, nothing new), the right page is the book's own title page —
 * just "About Me" and its one-line subtitle, the way a book's half-title page carries nothing but its name. No
 * invented copy here: `AboutMeHero` (the old full-bleed photo banner) is gone along with the bordered-card layout
 * it sat above, so `AppFrame` no longer floats its header for this scene (see the `floatHeader` comment there).
 *
 * The right page is deliberately short, and the left page can grow a lot (a full bio, a long author list) — a
 * plain CSS grid stretches both columns to match the taller one, which would blow the title page up into a tall,
 * mostly blank column. `lg:self-start` lets it size to its own content instead, and `lg:sticky lg:top-14` keeps it
 * in view near the top of the viewport as the profile below it scrolls, rather than scrolling away with a page of
 * empty space above it. Mobile stacks both pages in normal flow, so neither rule applies below `lg`.
 */
export default async function AboutMePage() {
  const user = await requireOnboardedUser();
  // Guaranteed to exist: created atomically when onboarding completes, and this page requires onboarding to be done.
  const [t, found] = await Promise.all([getTranslations("aboutMe"), findProfile(user.id)]);
  const profile = found!;

  return (
    <AppFrame user={user} scene="aboutMe" alignTop>
      <div className="-mt-6 max-w-5xl sm:-mt-14 lg:ml-10 lg:mt-0 lg:max-w-[min(64rem,calc(100%-11.5rem))]">
        <div className="book-frame relative grid gap-0 lg:grid-cols-2">
          <div className="book-grain" aria-hidden="true" />
          <div className="book-spine hidden lg:block" aria-hidden="true" />

          <div className="relative flex flex-col px-8 py-10 sm:px-12 sm:py-14">
            <AboutMeForm initial={profile} />
          </div>

          <div className="relative flex min-h-[14rem] flex-col px-8 py-10 sm:px-12 sm:py-14 lg:sticky lg:top-14 lg:self-start">
            <h1 className="max-w-[16ch] text-balance font-display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-[1.08] tracking-[-0.01em] text-ink">{t("title")}</h1>
            <p className="mt-3 max-w-[30ch] font-display text-[1.0625rem] italic leading-relaxed text-ink-2">{t("subtitle")}</p>
            <BotanicalBranch className="pointer-events-none absolute -bottom-6 -right-6 hidden size-28 text-[color:var(--scene-walnut)] opacity-60 sm:block" />
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
