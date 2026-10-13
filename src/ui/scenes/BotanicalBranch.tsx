/**
 * A single quiet line-art sprig — the Thoughts open book's one decorative flourish (bottom-right of the left
 * page, behind the closing quote), in the same flat-vector language as `StackScene`/`EmptyShelf`. `currentColor`
 * throughout, so the caller sets its tone via a text-color class rather than a hardcoded fill.
 */
export function BotanicalBranch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <path d="M10 110C40 90 55 70 60 40C63 22 72 10 90 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <path d="M38 86c6-10 16-14 26-12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
      <ellipse cx="45" cy="78" rx="7" ry="3.1" transform="rotate(-30 45 78)" fill="currentColor" opacity="0.32" />
      <ellipse cx="58" cy="68" rx="7" ry="3.1" transform="rotate(-18 58 68)" fill="currentColor" opacity="0.32" />
      <ellipse cx="68" cy="52" rx="6" ry="2.7" transform="rotate(-8 68 52)" fill="currentColor" opacity="0.32" />
      <ellipse cx="78" cy="30" rx="6" ry="2.7" transform="rotate(12 78 30)" fill="currentColor" opacity="0.32" />
      <ellipse cx="88" cy="16" rx="5.5" ry="2.5" transform="rotate(22 88 16)" fill="currentColor" opacity="0.32" />
    </svg>
  );
}
