"use client";

import { Plus, Trash2 } from "lucide-react";
import { TextField } from "@/ui/TextField";

/** A quote mid-edit: `page` is kept as free-typed text (never coerced while the field is being edited) and parsed
 *  to a number-or-null only on submit. */
export interface QuoteDraft {
  text: string;
  page: string;
}

export const emptyQuote = (): QuoteDraft => ({ text: "", page: "" });

interface Labels {
  quote: (index: number) => string;
  page: string;
  add: string;
  remove: string;
}

/** Repeatable "+ Add Quote" list: an open text area per quote (no visible character cap) plus an optional page
 *  number. Scrolls with the rest of the form; each quote's own text area grows and scrolls on its own if long. */
export function QuotesEditor({ value, onChange, labels }: { value: QuoteDraft[]; onChange: (next: QuoteDraft[]) => void; labels: Labels }) {
  function update(index: number, patch: Partial<QuoteDraft>) {
    onChange(value.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }
  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      {value.map((quote, index) => (
        <div key={index} className="rounded-2xl border border-rule-strong bg-surface p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">{labels.quote(index + 1)}</p>
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={labels.remove}
              className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-danger"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="control">
            <textarea aria-label={labels.quote(index + 1)} value={quote.text} onChange={(e) => update(index, { text: e.target.value })} rows={4} />
          </div>

          <div className="mt-3 max-w-[9rem]">
            <TextField label={labels.page} inputMode="numeric" value={quote.page} onChange={(e) => update(index, { page: e.target.value.replace(/\D/g, "") })} />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, emptyQuote()])}
        className="inline-flex items-center gap-2 self-start rounded-lg border border-rule-strong px-4 py-2.5 text-[0.9375rem] font-medium text-ink transition-colors hover:border-ink"
      >
        <Plus className="size-4" aria-hidden="true" />
        {labels.add}
      </button>
    </div>
  );
}
