import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThoughtEditor } from "@/features/thoughts/ThoughtEditor";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { listBookOptions } from "@/server/modules/books/book.repository";
import { getThoughtForRender } from "@/server/modules/thoughts/thought.cached";
import { AppFrame } from "@/ui/AppFrame";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const thought = await getThoughtForRender(user.id, id);
  return { title: thought?.title ?? "Thought" };
}

/** Every saved thought stays directly editable here — no separate read-only view (same rule as Book Detail). A
 *  thought that doesn't exist or belongs to someone else renders the same not-found page either way. */
export default async function ThoughtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const [record, books] = await Promise.all([getThoughtForRender(user.id, id), listBookOptions(user.id)]);
  if (!record) notFound();

  const thought = { ...record, createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString() };

  return (
    <AppFrame user={user} scene="thoughts" alignTop rules="edit">
      <div className="animate-rise mx-auto max-w-2xl lg:mt-[3.75rem]">
        <ThoughtEditor thought={thought} books={books} />
      </div>
    </AppFrame>
  );
}
