import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AddBookForm } from "@/features/books/AddBookForm";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { findRecommendationView } from "@/server/modules/mystery/mystery.repository";
import { CATALOG } from "@/server/mystery/catalog";
import { AppFrame } from "@/ui/AppFrame";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("addBook") };
}

/** Where "+ Add Your First Book" leads: the real Add Book form. Also where Mystery Book → Recently Recommended
 *  → "+ Add" leads (Section 8/9) — `?view=<id>` pre-fills title/author/genre from that shown recommendation's
 *  catalog book and has the form link the new entry back to it on save. An invalid or foreign recommendation id
 *  is silently ignored (falls back to the ordinary blank form) rather than erroring — never reachable through
 *  the UI itself, only via a tampered or stale link. */
export default async function AddBookPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const user = await requireOnboardedUser();
  const t = await getTranslations("books.add");
  const tGenres = await getTranslations("mysteryBook.genres");

  const { view: viewId } = await searchParams;
  const view = viewId ? await findRecommendationView(user.id, viewId) : null;
  const catalogBook = view ? CATALOG.find((b) => b.slug === view.bookSlug) : null;
  const fromView = catalogBook
    ? { viewId: view!.id, initialValues: { title: catalogBook.title, author: catalogBook.author, genres: [tGenres(catalogBook.genre)] } }
    : null;

  return (
    <AppFrame user={user} scene="books">
      <div className="animate-rise mx-auto max-w-2xl">
        <h1 className="max-w-[20ch] text-balance font-display text-[clamp(2rem,1.5rem+1.6vw,2.75rem)] leading-[1.1] tracking-[-0.01em]">{t("title")}</h1>
        <AddBookForm fromViewId={fromView?.viewId} initialValues={fromView?.initialValues} />
      </div>
    </AppFrame>
  );
}
