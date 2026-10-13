"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { FieldError } from "./FieldError";
import { FieldLabel } from "./FieldLabel";

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  tag?: string;
  /** Already-translated error text. */
  error?: string;
  id?: string;
  /** Live character count, e.g. "120 / 1500". */
  counter?: string;
  /** Keeps `label` as the field's accessible name but hides it visually (a heading elsewhere already shows it). */
  hideLabel?: boolean;
}

/** Multiline field. Any script; Enter inserts a new line (it never submits the form). */
export function TextArea({ label, tag, error, id, counter, hideLabel, ...rest }: TextAreaProps) {
  const auto = useId();
  const fieldId = id ?? `field-${auto}`;
  const errorId = `${fieldId}-error`;

  return (
    <div>
      <FieldLabel htmlFor={fieldId} tag={tag} hidden={hideLabel}>
        {label}
      </FieldLabel>
      <div className="control" data-invalid={error ? "true" : "false"}>
        <textarea id={fieldId} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} rows={6} {...rest} />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <FieldError id={errorId} message={error} />
        </div>
        {counter ? (
          <span aria-hidden="true" className="shrink-0 pt-1.5 text-sm tabular-nums text-muted">
            {counter}
          </span>
        ) : null}
      </div>
    </div>
  );
}
