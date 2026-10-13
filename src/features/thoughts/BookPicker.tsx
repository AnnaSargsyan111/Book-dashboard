"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FieldLabel } from "@/ui/FieldLabel";
import type { BookOption } from "./ThoughtEditor";

/**
 * A free-text search over the caller's own books — not a dropdown of everything, since a library can get long.
 * Typing filters by title or author; picking a suggestion links it, picking "No book" (or clearing the text)
 * un-links it. Closing with unmatched text snaps back to whatever is actually selected, so the field can never
 * show something that isn't really linked.
 */
export function BookPicker({
  label,
  placeholder,
  noneLabel,
  books,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  noneLabel: string;
  books: BookOption[];
  value: string | null;
  onChange: (bookId: string | null) => void;
}) {
  const uid = useId();
  const fieldId = `book-picker-${uid}`;
  const listId = `${fieldId}-list`;

  const selected = value ? (books.find((b) => b.id === value) ?? null) : null;
  const label_ = (b: BookOption) => `${b.title} — ${b.author}`;

  const [query, setQuery] = useState(selected ? label_(selected) : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selected ? label_(selected) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selected]);

  const q = query.trim().toLocaleLowerCase();
  const matches = (q ? books.filter((b) => b.title.toLocaleLowerCase().includes(q) || b.author.toLocaleLowerCase().includes(q)) : books).slice(0, 8);

  function close() {
    setOpen(false);
    setQuery(selected ? label_(selected) : "");
  }

  function pick(book: BookOption | null) {
    onChange(book ? book.id : null);
    setQuery(book ? label_(book) : "");
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(matches.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && matches[active]) pick(matches[active]);
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        close();
      }
    }
  }

  return (
    <div ref={root} className="relative">
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <div className="control">
        <input
          id={fieldId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-rule-strong bg-surface p-1.5 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.35)]"
        >
          {selected ? (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(null)}
              className="cursor-pointer rounded-lg px-3 py-2.5 text-[0.9375rem] text-muted hover:bg-rule/60"
            >
              {noneLabel}
            </li>
          ) : null}
          {matches.map((book, index) => (
            <li
              key={book.id}
              role="option"
              aria-selected={book.id === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(book)}
              onMouseMove={() => setActive(index)}
              className={`cursor-pointer rounded-lg px-3 py-2.5 text-[0.9375rem] ${index === active ? "bg-rule/60" : ""} ${book.id === value ? "font-medium text-ink" : "text-ink-2"}`}
            >
              {label_(book)}
            </li>
          ))}
          {matches.length === 0 ? <li className="px-3 py-2.5 text-[0.9375rem] text-muted">{placeholder}</li> : null}
        </ul>
      ) : null}
    </div>
  );
}
