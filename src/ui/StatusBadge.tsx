import type { BookStatus } from "@/shared/validation/book";

const DOT: Record<BookStatus, string> = {
  want_to_read: "bg-muted",
  currently_reading: "bg-marker",
  read: "bg-ok",
  did_not_finish: "bg-rule-strong",
};

const TONE = {
  light: "border-rule text-ink-2",
  dark: "border-white/25 bg-white/10 text-white backdrop-blur-sm",
} as const;

/** A reading-status pill: restrained, a small dot for the at-a-glance colour cue rather than a loud badge.
 *  `tone="dark"` is for sitting on the library card's cover-image scrim, where plain `text-ink-2` would vanish. */
export function StatusBadge({ status, label, tone = "light" }: { status: BookStatus; label: string; tone?: keyof typeof TONE }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.08em] ${TONE[tone]}`}>
      <span className={`size-1.5 rounded-full ${DOT[status]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
