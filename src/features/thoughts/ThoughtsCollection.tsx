"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { ThoughtDTO } from "@/shared/validation/thought";
import { ThoughtCard } from "./ThoughtCard";

type Filter = "all" | "recent" | "favorites" | "withBook";
const FILTERS: Filter[] = ["all", "recent", "favorites", "withBook"];
const RECENT_DAYS = 7;
/** How many entries one right-hand page holds before the next ones turn onto a fresh, numbered page. */
const PAGE_SIZE = 5;

/** Filters are a convenience, not a feature — they only appear once there's enough to actually sort through, and
 *  the filtering itself stays entirely client-side against the one list already on the page. Entries are laid
 *  out like a notebook's right-hand pages: a full page turns onto a blank, numbered next one while the left page
 *  (the intro) never changes. */
export function ThoughtsCollection({ thoughts }: { thoughts: ThoughtDTO[] }) {
  const t = useTranslations("thoughts.filters");
  const tp = useTranslations("thoughts.pagination");
  const [filter, setFilter] = useState<Filter>("all");
  const [requestedPage, setRequestedPage] = useState(1);

  const filtered = useMemo(() => {
    switch (filter) {
      case "favorites":
        return thoughts.filter((th) => th.favorite);
      case "withBook":
        return thoughts.filter((th) => th.book !== null);
      case "recent": {
        const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
        return thoughts.filter((th) => new Date(th.createdAt).getTime() >= cutoff);
      }
      default:
        return thoughts;
    }
  }, [thoughts, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-1 flex-col">
      {thoughts.length > 4 ? (
        <div role="tablist" aria-label={t("label")} className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => {
                setFilter(key);
                setRequestedPage(1);
              }}
              className={`rounded-full border px-3.5 py-1 text-[0.8125rem] font-medium transition-colors ${
                filter === key ? "border-ink bg-ink text-paper" : "border-rule-strong text-ink-2 hover:border-ink"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
      ) : null}

      <ol key={`${filter}-${page}`} className="border-b border-rule">
        {visible.map((thought, i) => (
          <ThoughtCard key={thought.id} thought={thought} index={i} />
        ))}
      </ol>

      {pageCount > 1 ? (
        <nav aria-label={tp("label")} className="mt-auto flex items-center justify-between gap-3 pt-8">
          <button
            type="button"
            onClick={() => setRequestedPage(page - 1)}
            disabled={page === 1}
            aria-label={tp("prev")}
            className="grid size-9 place-items-center rounded-full border border-rule-strong text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <p aria-live="polite" className="font-display text-[1.0625rem] italic text-ink-2">
            <span className="sr-only">{tp("page", { n: page })}</span>
            <span aria-hidden="true">{page}</span>
            <span aria-hidden="true" className="px-1.5 text-muted">
              /
            </span>
            <span aria-hidden="true" className="text-muted">
              {pageCount}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setRequestedPage(page + 1)}
            disabled={page === pageCount}
            aria-label={tp("next")}
            className="grid size-9 place-items-center rounded-full border border-rule-strong text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
