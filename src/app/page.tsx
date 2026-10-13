import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { MystBookLanding } from "@/features/home/MystBookLanding";
import { getCurrentUser } from "@/server/modules/auth/current-user";
import { ROUTES } from "@/shared/routes";
import { AppFrame } from "@/ui/AppFrame";
import { richMarkDark } from "@/ui/rich";

/**
 * The front door: a signed-out visitor starts by registering; a signed-in user who hasn't finished onboarding is
 * sent there. A signed-in, onboarded user is no longer redirected a second time — "/" now renders the app's own
 * hub page directly (`MystBookLanding`), an interactive, book-themed introduction to the five sections that links
 * out to each real page. `homePathFor` (src/shared/routes.ts) already resolves an onboarded user to `ROUTES.home`
 * (this very route), so every other entry point (login, register, onboarding completion) lands here too.
 */
export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.register);
  if (!user.onboardingCompleted) redirect(ROUTES.onboarding);

  const [tHome, tNav, tAboutMe, tBooks, tMysteryBook, tThoughts, tSettings] = await Promise.all([
    getTranslations("home"),
    getTranslations("nav"),
    getTranslations("aboutMe"),
    getTranslations("books"),
    getTranslations("mysteryBook"),
    getTranslations("thoughts"),
    getTranslations("settings"),
  ]);

  return (
    <AppFrame user={user} scene="home" alignTop>
      <MystBookLanding
        eyebrow={tHome("eyebrow", { name: user.firstName })}
        title={tHome.rich("title", richMarkDark)}
        intro={tHome("intro")}
        contentsLabel={tNav("tableOfContents")}
        copy={{
          aboutMe: { title: tAboutMe("title"), subtitle: tAboutMe("subtitle") },
          books: { title: tBooks("libraryTitle"), subtitle: tBooks("heroSubtitle") },
          mysteryBook: { title: tMysteryBook("entry.title"), subtitle: tMysteryBook("entry.subtitle") },
          thoughts: { title: tThoughts("title"), subtitle: tThoughts("subtitle") },
          settings: { title: tSettings("title"), subtitle: tSettings("subtitle") },
        }}
        welcomeModalSeen={user.welcomeModalSeen}
      />
    </AppFrame>
  );
}
