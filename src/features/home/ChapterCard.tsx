import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * One row of the hub page's "table of contents" — a chapter, not a dashboard card: a roman numeral, the
 * section's own nav icon, its real shipped title and subtitle (see `MystBookLanding`, which supplies these from
 * each section's own translations), and an arrow that only commits to appearing on hover/focus. No box, no
 * shadow, no rounded card — a thin top rule instead (`.profile-section`'s own language), because a floating-card
 * grid is the generic pattern this project deliberately avoids (see globals.css's "no floating cards" note).
 * `index` drives the row's own staggered entrance (`.chapter-row`, `--i`).
 */
export function ChapterCard({
  index,
  numeral,
  icon: Icon,
  title,
  subtitle,
  href,
}: {
  index: number;
  numeral: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <li className="chapter-row border-t border-rule" style={{ ["--i" as string]: index } as CSSProperties}>
      <Link href={href} className="chapter-card group flex items-start gap-5 py-7 sm:py-8">
        <span className="chapter-num grid size-9 shrink-0 place-items-center pt-0.5 font-display text-base italic text-muted sm:size-10 sm:text-lg">{numeral}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2.5 text-muted">
            <Icon className="size-[1.0625rem] shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-[0.11em]">{title}</span>
          </span>
          <span className="mt-2 block max-w-[38ch] text-balance font-display text-[clamp(1.25rem,1.05rem+0.7vw,1.5rem)] leading-snug tracking-[-0.01em] text-ink">{subtitle}</span>
        </span>
        <ArrowRight className="chapter-arrow mt-2 size-[1.125rem] shrink-0 -translate-x-1 text-muted opacity-0 transition-all duration-200 ease-out group-hover:text-ink sm:mt-2.5" aria-hidden="true" />
      </Link>
    </li>
  );
}
