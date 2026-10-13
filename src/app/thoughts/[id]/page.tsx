import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThoughtEditor } from "@/features/thoughts/ThoughtEditor";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { listBooks } from "@/server/modules/books/book.repository";
import { getThought } from "@/server/modules/thoughts/thought.repository";
import { AppFrame } from "@/ui/AppFrame";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const thought = await getThought(user.id, id);
  return { title: thought?.title ?? "Thought" };
}

/** Every saved thought stays directly editable here — no separate read-only view (same rule as Book Detail). A
 *  thought that doesn't exist or belongs to someone else renders the same not-found page either way. */
export default async function ThoughtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const [record, books] = await Promise.all([getThought(user.id, id), listBooks(user.id)]);
  if (!record) notFound();

  const thought = { ...record, createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString() };

  return (
    <AppFrame user={user} scene="thoughts">
      <div className="animate-rise mx-auto max-w-2xl">
        <ThoughtEditor thought={thought} books={books.map((b) => ({ id: b.id, title: b.title, author: b.author }))} />
      </div>
    </AppFrame>
  );
}
