"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { MysteryRecentRecommendation } from "@/shared/validation/mystery";
import { mysteryApi } from "./api";
import { RecommendationCard } from "./RecommendationCard";

/**
 * Mystery Book → "Recently Recommended" (Section 5–6): every "Show Me Now" pick this user has ever received,
 * newest first — fetched fresh on every mount rather than passed down from the server page, so returning here
 * after "+ Add" → Book Detail → Save always shows the real "Added to My Books" state (a server-fetched prop here
 * would risk Next.js's router cache serving the pre-add snapshot instead). Quietly does nothing while loading —
 * no skeleton flash for what's normally an instant local request — and never renders for `revealMode:
 * "keep_mystery"` picks at all (filtered server-side; see `MysteryRecentRecommendation`'s own doc comment).
 */
export function RecentlyRecommended() {
  const t = useTranslations("mysteryBook");
  const locale = useLocale();
  const [recommendations, setRecommendations] = useState<MysteryRecentRecommendation[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    mysteryApi
      .recent()
      .then(({ recommendations }) => {
        if (!cancelled) setRecommendations(recommendations);
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      });
    return () => {
      cancelled = true;
    };
    // `reasoning` is server-rendered text in the active locale (see the GET route) — re-fetch when the language
    // switcher changes locale, since that only triggers `router.refresh()`, which doesn't remount this component
    // or re-run this effect on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  if (recommendations === null) return null;

  return (
    <div className="animate-rise mt-14 max-w-5xl">
      <h2 className="font-display text-[clamp(1.375rem,1.1rem+1vw,1.75rem)] leading-[1.15] tracking-[-0.01em] text-cloth-ink">{t("recent.title")}</h2>

      {recommendations.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-rule-strong bg-surface px-6 py-10 text-center sm:px-10">
          <p className="mx-auto max-w-[28ch] text-balance font-display text-[1.25rem] leading-snug">{t("recent.emptyTitle")}</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-5">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.viewId}
              rec={rec}
              onRemoved={() => setRecommendations((prev) => (prev ?? []).filter((r) => r.viewId !== rec.viewId))}
              onReviewed={(feedbackRating, feedbackTags) =>
                setRecommendations((prev) => (prev ?? []).map((r) => (r.viewId === rec.viewId ? { ...r, feedbackRating, feedbackTags } : r)))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
