"use client";

import { Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { LIMITS } from "@/shared/validation/limits";
import { FEEDBACK_RATINGS, FEEDBACK_TAG_KEYS, type FeedbackRating, type FeedbackTagKey } from "@/shared/validation/mystery";
import { Button } from "@/ui/Button";
import { FormAlert } from "@/ui/FormAlert";
import { mysteryApi } from "./api";
import { Chip } from "./Chip";

const FEEDBACK_RATING_EMOJI: Record<FeedbackRating, string> = { loved: "❤️", okay: "👍", not_for_me: "👎" };

/**
 * The review icon on a "Recently Recommended" card that has been added to the library (shown beside the trash
 * icon), and the modal it opens: the same review questions the Mystery Book flow used to ask at its very end —
 * how it was (loved / okay / not for me), then what the reader liked. A review is left once: the icon is filled
 * afterwards, and opening it again shows that review read-only, with Submit disabled and a hover note saying so.
 *
 * The modal is portaled to `<body>` for the usual reason (a `position: fixed` child of an animated ancestor is
 * positioned against that ancestor), and stops its clicks from bubbling through the portal into the card.
 */
export function ReviewRecommendationButton({
  viewId,
  title,
  rating,
  tags,
  onReviewed,
}: {
  viewId: string;
  title: string;
  rating: FeedbackRating | null;
  tags: FeedbackTagKey[];
  onReviewed: (rating: FeedbackRating, tags: FeedbackTagKey[]) => void;
}) {
  const t = useTranslations("mysteryBook");
  const tc = useTranslations("common");
  const tk = useTranslateKey();

  const [open, setOpen] = useState(false);
  const [draftRating, setDraftRating] = useState<FeedbackRating | null>(rating);
  const [draftTags, setDraftTags] = useState<FeedbackTagKey[]>(tags);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const locked = rating !== null;

  function openModal(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDraftRating(rating);
    setDraftTags(tags);
    setError(null);
    setSubmitted(false);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy]);

  function toggleTag(key: FeedbackTagKey) {
    if (locked) return;
    setDraftTags((prev) => (prev.includes(key) ? prev.filter((tag) => tag !== key) : prev.length < LIMITS.feedbackTagsMax ? [...prev, key] : prev));
  }

  async function submit() {
    if (busy || locked || !draftRating) return;
    setBusy(true);
    setError(null);
    try {
      await mysteryApi.reviewRecommendation(viewId, { rating: draftRating, tags: draftTags.length > 0 ? draftTags : undefined });
      onReviewed(draftRating, draftTags);
      setSubmitted(true);
    } catch (e) {
      if (isApiRequestError(e)) setError(tk(e.messageKey) ?? null);
      else throw e;
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={t("recent.reviewIconLabel", { title })}
        onClick={openModal}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-black/15 text-white/85 backdrop-blur-[2px] transition-colors hover:bg-black/45 hover:text-white"
      >
        <Star className={`size-[1rem] ${rating ? "fill-[var(--scene-candle)] text-[var(--scene-candle)]" : ""}`} aria-hidden="true" />
      </button>

      {open
        ? createPortal(
            <div
              role="presentation"
              className="welcome-backdrop fixed inset-0 z-[80] flex items-center justify-center p-5"
              onClick={(e) => {
                e.stopPropagation();
                if (e.target === e.currentTarget && !busy) setOpen(false);
              }}
            >
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`review-${viewId}`}
                tabIndex={-1}
                className="welcome-panel relative w-full max-w-[28rem] rounded-[1.75rem] bg-surface p-7 text-center shadow-[0_50px_100px_-30px_rgb(0_0_0/0.55)] outline-none sm:p-9"
              >
                <button
                  type="button"
                  onClick={() => !busy && setOpen(false)}
                  aria-label={tc("close")}
                  className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
                >
                  <X className="size-[1.125rem]" aria-hidden="true" />
                </button>

                {submitted ? (
                  <div role="status">
                    <h2 id={`review-${viewId}`} className="font-display text-[1.5rem] leading-tight">
                      {t("reviewStep.submittedHeading")}
                    </h2>
                    <p className="mt-3 text-[1rem] leading-relaxed text-muted">{t("reviewStep.submittedBody")}</p>
                    <Button className="mt-6" onClick={() => setOpen(false)}>
                      {tc("close")}
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 id={`review-${viewId}`} className="mx-auto max-w-[22ch] text-balance font-display text-[1.5rem] leading-tight">
                      {t("reviewStep.title")}
                    </h2>
                    <p className="mt-1 text-[0.9375rem] text-muted">{title}</p>

                    <div role="radiogroup" aria-label={t("reviewStep.title")} className="mt-5 grid grid-cols-3 gap-3">
                      {FEEDBACK_RATINGS.map((key) => (
                        <button
                          key={key}
                          type="button"
                          role="radio"
                          aria-checked={draftRating === key}
                          aria-disabled={locked || undefined}
                          onClick={() => !locked && setDraftRating((prev) => (prev === key ? null : key))}
                          className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition-colors ${
                            draftRating === key
                              ? "border-ink bg-ink text-paper"
                              : locked
                                ? "cursor-not-allowed border-rule text-muted opacity-50"
                                : "border-rule-strong text-ink-2 hover:border-ink"
                          }`}
                        >
                          <span className="text-2xl">{FEEDBACK_RATING_EMOJI[key]}</span>
                          <span className="font-display text-[0.9375rem] leading-snug">{t(`feedbackRatings.${key}`)}</span>
                        </button>
                      ))}
                    </div>

                    {draftRating ? (
                      <div className="animate-rise mt-6">
                        <p className="text-sm font-medium text-ink-2">{t("reviewStep.tagsLabel")}</p>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          {FEEDBACK_TAG_KEYS.map((key) => (
                            <Chip key={key} active={draftTags.includes(key)} disabled={locked} onClick={() => toggleTag(key)}>
                              {t(`feedbackTags.${key}`)}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <FormAlert>{error}</FormAlert>

                    <span className="group/submit relative mt-6 inline-flex">
                      <Button onClick={() => void submit()} state={busy ? "loading" : "idle"} disabled={locked || !draftRating}>
                        {t("reviewStep.submit")}
                      </Button>
                      {locked ? (
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[18rem] -translate-x-1/2 rounded-lg bg-ink px-3 py-1.5 text-center text-xs font-medium leading-snug text-paper opacity-0 shadow-lg transition-opacity duration-150 group-hover/submit:opacity-100"
                        >
                          {t("recent.alreadyReviewed")}
                        </span>
                      ) : null}
                    </span>
                  </>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
