"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { FieldError } from "./FieldError";
import { FieldLabel } from "./FieldLabel";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  tag?: string;
  placeholder: string;
  options: SelectOption[];
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  id?: string;
  /** Keeps `label` as the field's accessible name but hides it visually (a heading elsewhere already shows it). */
  hideLabel?: boolean;
}

/** A single native `<select>`, styled like every other field. Kept plain and native (not a custom listbox) since a
 *  4-value enum like Status needs nothing fancier — it is fully keyboard- and mobile-native for free. */
export function Select({ label, tag, placeholder, options, value, onChange, onBlur, error, id, hideLabel }: SelectProps) {
  const auto = useId();
  const fieldId = id ?? `field-${auto}`;
  const errorId = `${fieldId}-error`;

  return (
    <div>
      <FieldLabel htmlFor={fieldId} tag={tag} hidden={hideLabel}>
        {label}
      </FieldLabel>
      <div className="control relative" data-invalid={error ? "true" : "false"}>
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={value ? "" : "text-muted/80"}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
