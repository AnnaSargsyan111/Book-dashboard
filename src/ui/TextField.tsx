"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { FieldError } from "./FieldError";
import { FieldLabel } from "./FieldLabel";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  /** Quiet tag next to the label, e.g. "Optional". */
  tag?: string;
  /** Already-translated error text. */
  error?: string;
  hint?: ReactNode;
  id?: string;
  /** Extra element inside the control, before the input (a fixed prefix, e.g. a country code). */
  leading?: ReactNode;
  /** Extra element inside the control, after the input (used by the password field's toggle). */
  trailing?: ReactNode;
  /** ids of extra elements that describe this input (for example the password checklist). */
  describedBy?: string;
  /** Keeps `label` as the field's accessible name but hides it visually (a heading elsewhere already shows it). */
  hideLabel?: boolean;
}

/** Label + input + inline error, wired together for assistive technology. */
export function TextField({ label, tag, error, hint, id, leading, trailing, describedBy, hideLabel, ...input }: TextFieldProps) {
  const auto = useId();
  const inputId = id ?? `field-${auto}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const described = [error ? errorId : null, hint ? hintId : null, describedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <FieldLabel htmlFor={inputId} tag={tag} hidden={hideLabel}>
        {label}
      </FieldLabel>
      <div className="control" data-invalid={error ? "true" : "false"} data-readonly={input.readOnly ? "true" : "false"}>
        {leading}
        <input id={inputId} aria-invalid={error ? true : undefined} aria-describedby={described} {...input} />
        {trailing}
      </div>
      {hint ? (
        <p id={hintId} className="pt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
