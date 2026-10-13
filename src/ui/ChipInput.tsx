"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { normalizeAuthor } from "@/shared/validation/onboarding";
import { ChipList } from "./ChipList";
import { TextField } from "./TextField";

interface ChipInputProps {
  label: string;
  tag?: string;
  placeholder?: string;
  hint?: ReactNode;
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
  /** A value could not be added. The caller decides how to word it. */
  onReject: (reason: "tooLong" | "tooMany") => void;
  /** Called when the person edits the text being typed (a refusal message can go away). */
  onEdit?: () => void;
  /** Called whenever the person leaves the field. */
  onLeave?: () => void;
  maxItems: number;
  maxLength: number;
  /** Already-translated error text. */
  error?: string;
  removeLabel: (name: string) => string;
  /** Keeps `label` as the field's accessible name but hides it visually (a heading elsewhere already shows it). */
  hideLabel?: boolean;
}

/**
 * Free-text chips: type a name, press Enter, it becomes a chip. Any script is accepted. Enter never submits the
 * surrounding form; leaving the field with text still in it adds that text too, so nothing typed is lost.
 * Duplicates (ignoring case) are quietly skipped.
 */
export function ChipInput({ label, tag, placeholder, hint, name, value, onChange, onReject, onEdit, onLeave, maxItems, maxLength, error, removeLabel, hideLabel }: ChipInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const next = normalizeAuthor(draft);
    if (!next) {
      setDraft("");
      return;
    }
    if (next.length > maxLength) return onReject("tooLong");
    if (value.some((existing) => existing.toLocaleLowerCase() === next.toLocaleLowerCase())) {
      setDraft("");
      return;
    }
    if (value.length >= maxItems) return onReject("tooMany");
    onChange([...value, next]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      // Not while an IME (Armenian, CJK...) is still composing a character.
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <TextField
        label={label}
        tag={tag}
        hideLabel={hideLabel}
        name={name}
        placeholder={placeholder}
        hint={hint}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          onEdit?.();
        }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          commit();
          onLeave?.();
        }}
        autoComplete="off"
        enterKeyHint="enter"
        error={error}
      />
      <ChipList chips={value.map((author) => ({ key: author, label: author }))} removeLabel={removeLabel} onRemove={(key) => onChange(value.filter((a) => a !== key))} />
    </div>
  );
}
