"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export interface Chip {
  key: string;
  label: string;
}

/** Removable chips (selected genres, favorite authors). Each remove button names the item it removes. */
export function ChipList({ chips, onRemove, removeLabel }: { chips: Chip[]; onRemove: (key: string) => void; removeLabel: (label: string) => string }) {
  return (
    <ul className="flex flex-wrap gap-2 empty:hidden" aria-live="polite">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.li
            key={chip.key}
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex max-w-full items-center gap-1 rounded-full border border-rule-strong bg-surface py-1 pl-3.5 pr-1 text-[0.9375rem]"
          >
            <span className="min-w-0 break-words">{chip.label}</span>
            <button
              type="button"
              onClick={() => onRemove(chip.key)}
              aria-label={removeLabel(chip.label)}
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-rule hover:text-ink"
            >
              <X className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
