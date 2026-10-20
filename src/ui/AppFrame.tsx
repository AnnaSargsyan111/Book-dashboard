import Link from "next/link";
import type { ReactNode } from "react";
import type { PublicUser } from "@/shared/api-errors";
import { ROUTES } from "@/shared/routes";
import { AccountMenu } from "./AccountMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileNav } from "./nav/MobileNav";
import { Sidebar } from "./nav/Sidebar";
import { PageScene, type PageSceneKey } from "./PageScene";

/**
 * Frame for the signed-in application: a dark library-cloth sidebar carries the five sections on desktop
 * (`Sidebar`); narrower screens get a slim top bar plus a full-screen, table-of-contents-style menu (`MobileNav`)
 * instead of the sidebar shrunk down. `scene` gives the content column its own warm backdrop (see PageScene);
 * omit it for frames that don't take one (there are none among the five sections today, but a future guarded
 * placeholder could still opt out).
 */
export function AppFrame({
  user,
  scene,
  alignTop,
  rules,
  children,
}: {
  /** `null` only for a page's `loading.tsx`: the same shell, with a placeholder where the account menu goes. */
  user: Pick<PublicUser, "firstName" | "lastName"> | null;
  scene?: PageSceneKey;
  /** Desktop only: lifts the page's first block to the sidebar logo's top line, with the header floating over it. */
  alignTop?: boolean;
  /** Thoughts' New / Edit pages, desktop: lines the ruling up with the form fields (see `PageScene`). */
  rules?: "new" | "edit";
  children: ReactNode;
}) {
  // Books is the one section still built on a full-bleed photo hero, bled up to the very top of the content
  // column (flush with the sidebar's top edge); on desktop the header floats over it instead of reserving its
  // own row above it, so the language switcher and account menu read as sitting on the hero image itself —
  // matching every reference screenshot, where the search/account icons sit directly on the photo.
  // Mystery Book, Thoughts, Settings, About Me and the hub page all keep the ordinary in-flow header instead:
  // each one's own "page" (a centered rounded hero card, an inset open book) sits in the normal padded content
  // rather than bled flush to the top, so there's no edge-to-edge photo for the header to float over.
  const floatHeader = scene === "books" || alignTop;

  return (
    <div className="min-h-dvh lg:flex">
      <Sidebar />
      <div className="relative flex min-h-dvh flex-1 flex-col">
        {scene && <PageScene scene={scene} rules={rules} />}
        <header
          className={`relative border-b border-rule px-5 py-4 sm:px-8 lg:border-b-0 lg:px-8 lg:py-6 ${floatHeader ? "lg:absolute lg:inset-x-0 lg:top-0 lg:z-20" : ""}`}
        >
          <div className="flex items-center gap-4">
            <Link href={ROUTES.home} className="lg:hidden">
              <Logo />
            </Link>
            <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
              <span className="hidden lg:block">
                <LanguageSwitcher />
              </span>
              {user ? <AccountMenu firstName={user.firstName} lastName={user.lastName} /> : <span className="size-9 animate-pulse rounded-full bg-ink/10 lg:size-8" aria-hidden="true" />}
              <MobileNav />
            </div>
          </div>
        </header>
        <main data-lang-content className={`w-full flex-1 px-5 py-12 sm:px-8 sm:py-20 ${alignTop ? "lg:pt-7" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
