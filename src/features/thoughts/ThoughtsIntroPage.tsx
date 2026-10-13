import type { LucideIcon } from "lucide-react";
import { BotanicalBranch } from "@/ui/scenes/BotanicalBranch";

interface FeatureRow {
  icon: LucideIcon;
  title: string;
  body: string;
}

/**
 * The open book's left-hand page: an editorial introduction to Thoughts, not a second hero — the real action
 * lives on the right page. Every feature row describes something the page actually does (write, link to a book,
 * filter) rather than aspirational copy, and the closing line is a real, attributed quote about writing (the
 * same "real quotes, never brand taglines" rule the sidebar already keeps), not an invented slogan.
 */
export function ThoughtsIntroPage({
  eyebrow,
  title,
  subtitle,
  body,
  features,
  closingQuote,
  closingAuthor,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  features: FeatureRow[];
  closingQuote: string;
  closingAuthor: string;
}) {
  return (
    <div className="relative flex h-full flex-col px-8 py-10 sm:px-12 sm:py-14">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{eyebrow}</p>
      <h1 className="mt-3 font-display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-[1.08] tracking-[-0.01em] text-ink">{title}</h1>
      <p className="mt-3 max-w-[32ch] font-display text-[1.0625rem] italic leading-relaxed text-ink-2">{subtitle}</p>
      <p className="mt-5 max-w-[42ch] text-[0.9375rem] leading-relaxed text-muted">{body}</p>

      <div className="mt-9 flex flex-col gap-6">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="flex items-start gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-rule-strong bg-surface text-ink-2">
                <Icon className="size-[1.0625rem]" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[1.0625rem] leading-snug text-ink">{feature.title}</h3>
                <p className="mt-1 max-w-[32ch] text-[0.875rem] leading-relaxed text-muted">{feature.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mt-auto pt-10">
        <p className="max-w-[26ch] text-balance font-display text-[1.0625rem] italic leading-relaxed text-ink-2">&ldquo;{closingQuote}&rdquo;</p>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.09em] text-muted">{closingAuthor}</p>
        <BotanicalBranch className="pointer-events-none absolute -bottom-6 -right-6 hidden size-28 text-[color:var(--scene-walnut)] opacity-60 sm:block" />
      </div>
    </div>
  );
}
