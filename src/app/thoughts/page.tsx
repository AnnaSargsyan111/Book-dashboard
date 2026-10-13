import type { Metadata } from "next";
import { BookOpen, Filter as FilterIcon, PenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ThoughtsCollection } from "@/features/thoughts/ThoughtsCollection";
import { ThoughtsIntroPage } from "@/features/thoughts/ThoughtsIntroPage";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { listThoughts } from "@/server/modules/thoughts/thought.repository";
import { ROUTES } from "@/shared/routes";
import { AppFrame } from "@/ui/AppFrame";
import { ButtonLink } from "@/ui/ButtonLink";
import { richMark } from "@/ui/rich";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("thoughts") };
}

/**
 * Thoughts, as an open book: the left page is a real-functionality editorial introduction (not a second hero —
 * see `ThoughtsIntroPage`), the right page is the actual journal — empty-state invitation or the real list,
 * exactly the same branching `thoughts.length === 0` the page always had, just restyled. `.book-frame` sits
 * inset in the normal padded content column (Mystery Book's own "centered card" pattern), on top of the page's
 * existing ruled-paper `PageScene` wash rather than replacing it.
 */
export default async function ThoughtsPage() {
  const user = await requireOnboardedUser();
  const t = await getTranslations("thoughts");
  const ti = await getTranslations("thoughts.intro");
  const records = await listThoughts(user.id);
  const thoughts = records.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }));

  return (
    <AppFrame user={user} scene="thoughts" alignTop>
      <div className="-mt-6 max-w-5xl sm:-mt-14 lg:mt-0 lg:max-w-[min(64rem,calc(100%-9rem))]">
        <div className="book-frame relative grid gap-0 lg:grid-cols-2">
          <div className="book-grain" aria-hidden="true" />
          <div className="book-spine hidden lg:block" aria-hidden="true" />

          <ThoughtsIntroPage
            eyebrow={ti("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
            body={ti("body")}
            features={[
              { icon: PenLine, title: ti("features.write.title"), body: ti("features.write.body") },
              { icon: BookOpen, title: ti("features.link.title"), body: ti("features.link.body") },
              { icon: FilterIcon, title: ti("features.find.title"), body: ti("features.find.body") },
            ]}
            closingQuote={ti("closingQuote")}
            closingAuthor={ti("closingAuthor")}
          />

          <div className="relative flex flex-col px-8 py-10 sm:px-12 sm:py-14">
            {thoughts.length === 0 ? (
              <>
                <p className="font-display text-[1.0625rem] italic text-ink-2">{ti("rightEyebrow")}</p>
                <div className="animate-rise flex flex-1 flex-col items-center justify-center py-8 text-center">
                  <span aria-hidden="true" className="font-display text-[4rem] leading-none text-rule-strong">
                    “
                  </span>
                  <h2 className="max-w-[20ch] text-balance font-display text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] leading-[1.1] tracking-[-0.01em]">
                    {t.rich("empty.title", richMark)}
                  </h2>
                  <p className="mt-3 max-w-[32ch] text-[0.9375rem] leading-relaxed text-muted">{t("empty.body")}</p>
                  <ButtonLink href={ROUTES.newThought} className="mt-6">
                    {t("empty.cta")}
                  </ButtonLink>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-display text-[1.0625rem] italic text-ink-2">{ti("rightEyebrow")}</p>
                  <ButtonLink href={ROUTES.newThought} className="self-start">
                    {t("newCta")}
                  </ButtonLink>
                </div>
                <ThoughtsCollection thoughts={thoughts} />
              </>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
