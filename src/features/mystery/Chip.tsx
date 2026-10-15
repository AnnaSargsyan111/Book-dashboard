import type { ReactNode } from "react";

/** A selectable chip: toggled multi-select (mood, genre) shares this look throughout the flow. `title` is an
 *  optional hint — used by the mood chips to explain each mood — rendered as a custom tooltip (not the native
 *  `title` attribute, whose browser-default hover delay made it easy to miss). */
export function Chip({ active, disabled, onClick, title, children }: { active: boolean; disabled?: boolean; onClick: () => void; title?: string; children: ReactNode }) {
  return (
    <span className="group/chip relative inline-flex">
      <button
        type="button"
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={`rounded-full border px-4 py-2.5 text-[0.9375rem] transition-colors ${
          active ? "border-ink bg-ink text-paper" : disabled ? "cursor-not-allowed border-rule text-muted opacity-50" : "border-rule-strong text-ink-2 hover:border-ink"
        }`}
      >
        {children}
      </button>
      {title ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[16rem] -translate-x-1/2 rounded-lg bg-ink px-3 py-1.5 text-center text-xs font-medium leading-snug text-paper opacity-0 shadow-lg transition-opacity duration-150 group-hover/chip:opacity-100 group-focus-within/chip:opacity-100"
        >
          {title}
        </span>
      ) : null}
    </span>
  );
}
