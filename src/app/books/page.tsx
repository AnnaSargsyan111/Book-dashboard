import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BooksCollection } from "@/features/books/BooksCollection";
import { BooksHero } from "@/features/books/BooksHero";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { listBooks } from "@/server/modules/books/book.repository";
import { ROUTES } from "@/shared/routes";
import { AppFrame } from "@/ui/AppFrame";
import { ButtonLink } from "@/ui/ButtonLink";
import { richMark } from "@/ui/rich";
import { EmptyShelf } from "@/ui/scenes/EmptyShelf";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("books") };
}

/**
 * The user's library. Empty state for a new user (an invitation, not an apology); a cover-forward grid once books
 * exist, each card linking to Book Detail. The one-time Welcome Modal now lives on the app's hub page
 * (`src/app/page.tsx`, the user's first stop after onboarding), not here — see `MystBookLanding`.
 */
export default async function BooksPage() {
  const user = await requireOnboardedUser();
  const t = await getTranslations("books");
  const books = await listBooks(user.id);

  return (
    <AppFrame user={user} scene="books">
      <BooksHero title={t("libraryTitle")} subtitle={t("heroSubtitle")} compact={books.length === 0} />

      <div className="max-w-5xl">
        {books.length === 0 ? (
          // On desktop the illustration sits beside the text (not above it), so the empty page — compact hero
          // included — fits one screen with no scrolling. Stacked and centred below that, where scrolling is normal.
          <div className="animate-rise mx-auto flex max-w-[30rem] flex-col items-center pb-8 pt-12 text-center lg:max-w-[46rem] lg:flex-row lg:gap-12 lg:pb-0 lg:pt-10 lg:text-left">
            <div className="w-full lg:w-[16rem] lg:shrink-0">
              <EmptyShelf />
            </div>
            <div className="flex flex-col items-center lg:items-start">
              <p className="mb-3 mt-8 text-xs font-medium uppercase tracking-[0.14em] text-muted lg:mt-0">{t("eyebrow")}</p>
              <h2 className="max-w-[18ch] text-balance font-display text-[clamp(2rem,1.5rem+2vw,3rem)] leading-[1.1] tracking-[-0.01em] lg:max-w-[20ch] lg:text-[clamp(1.75rem,1.2rem+1.4vw,2.5rem)]">
                {t.rich("empty.title", richMark)}
              </h2>
              <p className="mt-4 max-w-[36ch] text-[1.0625rem] leading-relaxed text-muted lg:mt-3">{t("empty.body")}</p>
              <ButtonLink href={ROUTES.addBook} className="mt-8 lg:mt-6">
                {t("addFirst")}
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="animate-rise mt-12">
            <BooksCollection
              books={books.map((b) => ({ ...b, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() }))}
              action={
                <ButtonLink href={ROUTES.addBook} variant="warm">
                  {t("addAnother")}
                </ButtonLink>
              }
            />
          </div>
        )}
      </div>
    </AppFrame>
  );
}
