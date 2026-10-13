import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetailForm } from "@/features/books/BookDetailForm";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { getBook } from "@/server/modules/books/book.repository";
import { ROUTES } from "@/shared/routes";
import { AppFrame } from "@/ui/AppFrame";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const book = await getBook(user.id, id);
  return { title: book?.title ?? "Book" };
}

/** Book Detail: every field from Add Book, editable in place. Reached from a library card; a book that doesn't
 *  exist or belongs to someone else renders the same not-found page either way. */
export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const record = await getBook(user.id, id);
  if (!record) notFound();

  const book = { ...record, createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString() };

  return (
    <AppFrame user={user} scene="books">
      <div className="animate-rise">
        <BookDetailForm book={book} backHref={ROUTES.books} booksHref={ROUTES.books} />
      </div>
    </AppFrame>
  );
}
