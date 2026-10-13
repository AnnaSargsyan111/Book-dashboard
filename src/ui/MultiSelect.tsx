"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChipList } from "./ChipList";
import { FieldError } from "./FieldError";
import { FieldLabel } from "./FieldLabel";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  tag?: string;
  name: string;
  placeholder: string;
  /** Text shown on the closed control once something is selected, e.g. "2 of 5 selected". */
  summary: (count: number) => string;
  /** Accessible name of the popup list. */
  listLabel: string;
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  /** The person tried to pick more than `max`. */
  onLimit: () => void;
  /** Called when the dropdown closes (the person has left the field). */
  onLeave?: () => void;
  /** Already-translated error text. */
  error?: string;
  removeLabel: (name: string) => string;
  /** Keeps `label` as the control's accessible name but hides it visually (a heading elsewhere already shows it). */
  hideLabel?: boolean;
  /** Skips the control's own chip row — for a caller that already shows the current selection itself (Book
   *  Genre: the free-text chip field right below already echoes the full, combined list). */
  hideChips?: boolean;
}

/**
 * Multi-select dropdown following the ARIA combobox + listbox pattern: focus stays on the control, arrow keys move
 * through the options, Space/Enter toggles, Escape closes. Selected items also appear as removable chips, so the
 * current choice is always visible without opening the list. Picking a sixth item is refused (the caller shows the
 * limit message) rather than silently dropping something.
 */
export function MultiSelect({ label, tag, name, placeholder, summary, listLabel, options, value, onChange, max, onLimit, onLeave, error, removeLabel, hideLabel, hideChips }: MultiSelectProps) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const listId = `${uid}-list`;
  const errorId = `${uid}-error`;
  const optionId = (index: number) => `${uid}-opt-${index}`;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const close = () => {
    if (!open) return;
    setOpen(false);
    onLeave?.();
  };

  // Click / tap outside closes.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(false);
        onLeave?.();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onLeave]);

  // Keep the active option visible while arrowing through a long list.
  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else if (value.length >= max) {
      onLimit();
    } else {
      onChange([...value, optionValue]);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault(); // Enter must never submit the form from here
        if (!open) setOpen(true);
        else if (options[active]) toggle(options[active].value);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      case "Tab":
        close();
        break;
    }
  }

  const selected = options.filter((o) => value.includes(o.value));

  return (
    <div className="flex flex-col gap-3">
      <div ref={root} className="relative">
        <FieldLabel id={labelId} tag={tag} hidden={hideLabel}>
          {label}
        </FieldLabel>
        <div className="control" data-invalid={error ? "true" : "false"}>
          <button
            type="button"
            name={name}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-labelledby={labelId}
            aria-activedescendant={open ? optionId(active) : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onClick={() => (open ? close() : setOpen(true))}
            onKeyDown={onKeyDown}
            className="flex h-[3.125rem] w-full items-center justify-between gap-3 px-4 text-left"
          >
            <span className={value.length ? "text-ink" : "text-muted/80"}>{value.length ? summary(value.length) : placeholder}</span>
            <ChevronDown className={`size-5 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.ul
              ref={list}
              id={listId}
              role="listbox"
              aria-multiselectable="true"
              aria-label={listLabel}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-rule-strong bg-surface p-1.5 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.35)]"
            >
              {options.map((option, index) => {
                const isSelected = value.includes(option.value);
                return (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    // mousedown would move focus off the combobox; keeping it there keeps keyboard control
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggle(option.value)}
                    onMouseMove={() => setActive(index)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[0.9375rem] ${
                      index === active ? "bg-rule/60" : ""
                    } ${isSelected ? "font-medium text-ink" : "text-ink-2"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`grid size-[1.125rem] shrink-0 place-items-center rounded-[0.3rem] border transition-all duration-150 ${
                        isSelected ? "scale-105 border-marker bg-marker" : "border-rule-strong bg-transparent"
                      }`}
                    >
                      {isSelected ? <Check className="size-3 text-[color:var(--marker-ink)]" strokeWidth={3} /> : null}
                    </span>
                    <span>{option.label}</span>
                  </li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>

        <FieldError id={errorId} message={error} />
      </div>

      {hideChips ? null : (
        <ChipList
          chips={selected.map((o) => ({ key: o.value, label: o.label }))}
          removeLabel={removeLabel}
          onRemove={(key) => onChange(value.filter((v) => v !== key))}
        />
      )}
    </div>
  );
}
