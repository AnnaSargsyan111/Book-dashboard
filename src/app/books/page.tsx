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
      <BooksHero title={t("libraryTitle")} subtitle={t("heroSubtitle")} />

      <div className="max-w-5xl">
        {books.length === 0 ? (
          <div className="animate-rise mx-auto flex max-w-[30rem] flex-col items-center pb-8 pt-12 text-center">
            <EmptyShelf />
            <p className="mb-3 mt-8 text-xs font-medium uppercase tracking-[0.14em] text-muted">{t("eyebrow")}</p>
            <h2 className="max-w-[18ch] text-balance font-display text-[clamp(2rem,1.5rem+2vw,3rem)] leading-[1.1] tracking-[-0.01em]">
              {t.rich("empty.title", richMark)}
            </h2>
            <p className="mt-4 max-w-[36ch] text-[1.0625rem] leading-relaxed text-muted">{t("empty.body")}</p>
            <ButtonLink href={ROUTES.addBook} className="mt-8">
              {t("addFirst")}
            </ButtonLink>
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
