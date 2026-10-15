import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ThoughtEditor } from "@/features/thoughts/ThoughtEditor";
import { listBookOptions } from "@/server/modules/books/book.repository";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { AppFrame } from "@/ui/AppFrame";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("newThought") };
}

/** Where "+ New Thought" leads: straight into writing, nothing to configure first. */
export default async function NewThoughtPage() {
  const user = await requireOnboardedUser();
  const t = await getTranslations("thoughts.new");
  const books = await listBookOptions(user.id);

  return (
    <AppFrame user={user} scene="thoughts" alignTop>
      <div className="animate-rise mx-auto max-w-2xl lg:mt-[3.75rem]">
        <h1 className="max-w-[20ch] text-balance font-display text-[clamp(2rem,1.5rem+1.6vw,2.75rem)] leading-[1.1] tracking-[-0.01em]">{t("title")}</h1>
        <ThoughtEditor books={books} />
      </div>
    </AppFrame>
  );
}
