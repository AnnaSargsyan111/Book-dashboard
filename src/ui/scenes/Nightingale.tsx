/**
 * The hub page's one illustrated flourish, perched in the empty cell a fifth chapter always leaves in a
 * two-column grid (see `MystBookLanding`) — a small bird on a branch, in the same flat, abstracted line-art
 * language as `BotanicalBranch` (a few strokes and filled shapes, not a literal illustration). Paired there with
 * `.landing-beam`, the warm shaft of light it sits in. `currentColor` throughout, so the caller sets its tone via
 * a text-color class rather than a hardcoded fill.
 */
export function Nightingale({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <path d="M6 101C40 93 76 91 114 67" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      <path d="M53 85L51 97M63 85L65 97" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="59" cy="71" rx="17" ry="12.5" transform="rotate(-8 59 71)" fill="currentColor" opacity="0.42" />
      <path d="M53 68c8-6 16-6 23-1-6 1-12 5-15 10-4-3-6-6-8-9Z" fill="currentColor" opacity="0.28" />
      <path d="M74 75c11 2 20 9 26 18M71 80c8 4 15 10 19 18" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.42" />
      <circle cx="43" cy="59" r="9.5" fill="currentColor" opacity="0.42" />
      <path d="M34 57L22 53L35 49Z" fill="currentColor" opacity="0.42" />
      <circle cx="41" cy="56.5" r="1.5" fill="currentColor" opacity="0.65" />
      <path d="M17 49c3-3 7-3 9 0M13 44c3-4 8-4 11-1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.32" />
    </svg>
  );
}
