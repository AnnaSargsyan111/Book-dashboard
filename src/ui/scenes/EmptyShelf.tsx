/**
 * The Books page, empty state: one book leaning on a shelf, with a dashed "ghost" slot beside it for the next one.
 * Not a sad "no books yet" — an invitation, drawn in the same flat, pastel vector language as the onboarding stack.
 */
export function EmptyShelf() {
  return (
    <svg viewBox="0 0 320 200" className="mx-auto h-auto w-full max-w-[19rem]" fill="none" aria-hidden="true">
      <ellipse cx="160" cy="177" rx="120" ry="8" fill="#000" opacity="0.07" />

      {/* the shelf */}
      <rect x="34" y="164" width="252" height="9" rx="4.5" fill="var(--rule-strong)" opacity="0.5" />

      {/* the ghost slot: where the next book will stand */}
      <rect x="180" y="92" width="34" height="72" rx="3" stroke="var(--rule-strong)" strokeDasharray="4 5" strokeWidth="1.6" opacity="0.55" />

      {/* the one book, leaning into the empty space beside it */}
      <g transform="rotate(-7 100 130)">
        <rect x="70" y="66" width="58" height="98" rx="4" fill="#9cc4b4" />
        <rect x="70" y="66" width="10" height="98" rx="4" fill="#7fae9c" />
        <rect x="70" y="66" width="58" height="4" rx="2" fill="#fff" opacity="0.3" />
      </g>
      {/* a second, lower title lying flat where it slid off the lean */}
      <rect x="126" y="150" width="66" height="14" rx="3" fill="#edb98c" opacity="0.9" />
      <rect x="126" y="150" width="66" height="3" rx="1.5" fill="#fff" opacity="0.25" />

      <circle cx="254" cy="54" r="3" fill="var(--marker)" />
      <circle cx="270" cy="80" r="2" fill="#8fb6a6" />
      <circle cx="58" cy="44" r="2.4" fill="#dba3a1" />
    </svg>
  );
}
