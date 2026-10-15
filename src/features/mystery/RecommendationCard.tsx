"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { addBookFromViewPath, bookDetailPath } from "@/shared/routes";
import type { FeedbackRating, FeedbackTagKey, MysteryRecentRecommendation } from "@/shared/validation/mystery";
import { CoverImage } from "@/ui/CoverImage";
import { DeleteRecommendationButton } from "./DeleteRecommendationButton";
import { ReviewRecommendationButton } from "./ReviewRecommendationButton";

/**
 * One past "Show Me Now" recommendation (Section 7–9): cover-forward, the same jacket-overlay treatment
 * `BookCard` already uses for the library grid, with the "why this pick" reasoning underneath (too long to fit
 * on the cover itself) and a single action — "+ Add" opens Book Detail pre-filled (never creates the library
 * entry directly), or, once it's been added, a quiet "Added to My Books" label plus a link to the real entry
 * instead — which is also when a review icon appears beside the trash icon (it opens the review modal). The corner trash icon is `BookCard`'s own `DeleteBookButton` (overlay variant), same spot and look,
 * for `onRemoved` — this card's own existence, not the library book "+ Add" may have already made.
 */
export function RecommendationCard({
  rec,
  onRemoved,
  onReviewed,
}: {
  rec: MysteryRecentRecommendation;
  onRemoved: () => void;
  onReviewed: (rating: FeedbackRating, tags: FeedbackTagKey[]) => void;
}) {
  const t = useTranslations("mysteryBook.recent");
  const tg = useTranslations("mysteryBook.genres");

  return (
    <article className="group relative">
      <div className="overflow-hidden rounded-xl shadow-[0_2px_14px_-6px_rgb(0_0_0/0.18)] transition-[transform,box-shadow] duration-300 ease-out group-hover:shadow-[0_20px_36px_-14px_rgb(0_0_0/0.3)] sm:rounded-2xl lg:group-hover:-translate-y-1">
        <CoverImage
          src={rec.coverUrl}
          title={rec.title}
          alt=""
          overlay={
            <>
              <span className="w-fit rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[0.625rem] text-white/85 backdrop-blur-sm">{tg(rec.genre)}</span>
              <h3 className="line-clamp-2 text-balance font-display text-[0.9375rem] leading-snug text-white sm:text-[1.0625rem]">{rec.title}</h3>
              <p className="line-clamp-1 text-xs text-white/75 sm:text-sm">{rec.author}</p>
            </>
          }
        />
      </div>

      <div className="absolute right-2 top-2 flex items-center gap-1.5 sm:right-2.5 sm:top-2.5">
        {rec.libraryBookId ? (
          <ReviewRecommendationButton viewId={rec.viewId} title={rec.title} rating={rec.feedbackRating} tags={rec.feedbackTags} onReviewed={onReviewed} />
        ) : null}
        <DeleteRecommendationButton viewId={rec.viewId} title={rec.title} inLibrary={rec.libraryBookId !== null} onRemoved={onRemoved} />
      </div>

      <p className="mt-3 line-clamp-2 text-[0.8125rem] italic leading-relaxed text-cloth-ink/65">{rec.reasoning}</p>

      {rec.libraryBookId ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-[0.8125rem] font-medium text-[var(--scene-candle)]">{t("added")}</span>
          <Link href={bookDetailPath(rec.libraryBookId)} className="text-[0.8125rem] font-medium text-cloth-ink/80 underline-offset-4 hover:text-cloth-ink hover:underline">
            {t("viewInBooks")}
          </Link>
        </div>
      ) : (
        <Link
          href={addBookFromViewPath(rec.viewId)}
          className="mt-2.5 inline-flex items-center rounded-full border border-cloth-ink/30 px-3.5 py-1.5 text-[0.8125rem] font-medium text-cloth-ink/80 transition-colors hover:border-cloth-ink hover:text-cloth-ink"
        >
          {t("addCta")}
        </Link>
      )}
    </article>
  );
}
