"use client";

import { ChevronRight, Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { type CSSProperties, type MouseEvent, useState } from "react";
import { formatDate } from "@/lib/format-date";
import { thoughtDetailPath } from "@/shared/routes";
import type { ThoughtDTO } from "@/shared/validation/thought";
import { thoughtsApi } from "./api";
import { DeleteThoughtButton } from "./DeleteThoughtButton";

/**
 * One journal entry, as a compact row in the open book's right page (the reference's editorial list style) —
 * same real behaviour as before, just restyled: the whole row opens the thought for editing, Favorite and
 * Delete sit outside that link as their own controls so they never trigger it. No thumbnail: a thought has no
 * image of its own in the data model, so showing one would mean faking it on every single entry — dropped
 * rather than invented. `index` staggers the row's own rise-in (`.animate-rise`); it always ends fully visible,
 * unlike the hub's scroll-gated `.chapter-row`, which would leave a long list hidden if its reveal never fired.
 */
export function ThoughtCard({ thought, index }: { thought: ThoughtDTO; index: number }) {
  const t = useTranslations("thoughts.card");
  const locale = useLocale();

  const [favorite, setFavorite] = useState(thought.favorite);
  const [busy, setBusy] = useState(false);

  async function toggleFavorite(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const next = !favorite;
    setBusy(true);
    setFavorite(next);
    try {
      await thoughtsApi.update(thought.id, { title: thought.title ?? "", text: thought.text, bookId: thought.book?.id ?? null, favorite: next });
    } catch {
      setFavorite(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="animate-rise border-t border-rule" style={{ animationDelay: `${Math.min(index, 8) * 70}ms` } as CSSProperties}>
      <Link href={thoughtDetailPath(thought.id)} className="chapter-card group flex items-start gap-4 py-5">
        <div className="min-w-0 flex-1">
          {thought.title ? <h3 className="truncate font-display text-[1.0625rem] leading-snug text-ink">{thought.title}</h3> : null}
          <p className={`line-clamp-2 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-2 ${thought.title ? "mt-1" : ""}`}>{thought.text}</p>
          <p className="mt-2 text-xs text-muted">
            {formatDate(thought.createdAt, locale)}
            {thought.book ? ` · ${t("inspiredBy")} ${thought.book.title}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
          <button
            type="button"
            onClick={toggleFavorite}
            aria-pressed={favorite}
            aria-label={favorite ? t("unfavorite") : t("favorite")}
            className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors ${favorite ? "text-danger" : "text-muted hover:bg-paper hover:text-ink"}`}
          >
            <Heart className="size-[1.0625rem]" fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
          </button>
          <DeleteThoughtButton id={thought.id} />
          <ChevronRight className="chapter-arrow size-[1.0625rem] shrink-0 -translate-x-1 text-muted opacity-0 transition-all duration-200 ease-out" aria-hidden="true" />
        </div>
      </Link>
    </li>
  );
}
