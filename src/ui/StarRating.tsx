"use client";

import { Star } from "lucide-react";

const STEPS = [1, 2, 3, 4, 5];
const SIZES = { sm: "size-4", md: "size-8" } as const;

interface StarRatingProps {
  value: number | null;
  label: string;
  /** Omit for a plain read-only display (a book card's own rating) — full strength, just non-interactive. */
  onChange?: (next: number) => void;
  /** The field is showing but not applicable right now (Status isn't "Read") — dimmed and inert, not hidden. */
  disabled?: boolean;
  size?: keyof typeof SIZES;
}

/**
 * Tappable half-star widget: 1–5 in 0.5 steps, one click per half. `disabled` renders it visibly inactive (every
 * Status except "Read") without hiding it — the star shapes and the current value (if any) stay on screen, just
 * dimmed and inert, so the field never jumps in and out of the layout as Status changes. Without `onChange` it is
 * a plain read-only display instead (a book card's own rating), shown at full strength.
 */
export function StarRating({ value, onChange, disabled, label, size = "md" }: StarRatingProps) {
  const readOnly = !onChange;
  const starClass = SIZES[size];

  return (
    <div role="group" aria-label={label} aria-disabled={disabled || undefined} className={`inline-flex gap-1 ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      {STEPS.map((n) => {
        const fill = value == null ? 0 : Math.min(1, Math.max(0, value - (n - 1)));
        return (
          <span key={n} className={`relative inline-block shrink-0 ${starClass}`}>
            <Star className={`absolute inset-0 ${starClass} text-rule-strong`} strokeWidth={1.5} aria-hidden="true" />
            {fill > 0 ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }} aria-hidden="true">
                <Star className={`${starClass} fill-current text-marker`} strokeWidth={1.5} />
              </span>
            ) : null}
            {readOnly ? null : (
              <>
                <button type="button" tabIndex={disabled ? -1 : 0} aria-label={String(n - 0.5)} className="absolute inset-y-0 left-0 w-1/2" onClick={() => onChange(n - 0.5)} />
                <button type="button" tabIndex={disabled ? -1 : 0} aria-label={String(n)} className="absolute inset-y-0 right-0 w-1/2" onClick={() => onChange(n)} />
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
