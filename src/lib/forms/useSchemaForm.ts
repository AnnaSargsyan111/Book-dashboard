"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { z, ZodType } from "zod";
import { isApiRequestError, type ApiRequestError } from "@/lib/api/client";
import { fieldErrorKeys } from "@/shared/validation/auth";

export type FormStatus = "idle" | "submitting" | "success";

/**
 * One form engine for every auth screen. It runs the SAME shared Zod schema the API uses, so a rule cannot pass in
 * the browser and fail on the server (or the other way round). Errors are translation KEYS; components translate
 * them, which is why switching language mid-form re-words every message instantly.
 *
 *  - A field shows its error only once a submit was attempted while it was invalid; clicking away from that
 *    field (blur) clears it again, so the message never lingers after the person has moved on.
 *  - Submit validates every field at once and shows all problems together; the API is not called if any fail.
 *  - Field errors returned by the server appear on the matching fields and clear as soon as that field is edited.
 *  - While a request is in flight (or has succeeded and is navigating) a second submit is ignored.
 */
export function useSchemaForm<S extends ZodType, V extends Record<string, unknown>>(options: {
  schema: S;
  initialValues: V;
  onSubmit: (data: z.infer<S>) => Promise<void>;
  /** Fields emptied when the server rejects the attempt (wrong credentials, taken email...). Never on a network failure. */
  clearOnError?: (keyof V)[];
}) {
  const [values, setValues] = useState<V>(options.initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof V, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState<ApiRequestError | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);

  const schemaErrors = useMemo(() => {
    const result = options.schema.safeParse(values);
    return result.success ? {} : fieldErrorKeys(result.error);
  }, [options.schema, values]);

  // After a failed submit, move focus to the first invalid field.
  useEffect(() => {
    if (attempts > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempts]);

  /** Sets any field (text, or the list value of a chip / multi-select field) and clears its server-side error. */
  function setValue<K extends keyof V>(name: K, value: V[K]) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerErrors((prev) => {
      if (!(name in prev)) return prev;
      const { [name as string]: _removed, ...rest } = prev;
      return rest;
    });
  }

  /** Dismisses a field's visible error on the way out (used by the list-style fields, which have no plain onBlur). */
  function dismiss(name: keyof V & string) {
    setTouched((prev) => ({ ...prev, [name]: false }));
  }

  /** Input props for one text field (spread onto the input component). */
  function field(name: keyof V & string) {
    return {
      name,
      value: values[name] as unknown as string,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(name, e.target.value as V[typeof name]),
      onBlur: () => dismiss(name),
    };
  }

  /** Translation key of the error to show for a field, or undefined when it should look calm. */
  function errorKey(name: keyof V & string): string | undefined {
    return serverErrors[name] ?? (touched[name] ? schemaErrors[name] : undefined);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current || status !== "idle") return;

    setSubmitted(true);
    setFormError(null);
    const parsed = options.schema.safeParse(values);
    if (!parsed.success) {
      setTouched(Object.fromEntries(Object.keys(fieldErrorKeys(parsed.error)).map((name) => [name, true])) as Partial<Record<keyof V, boolean>>);
      setAttempts((n) => n + 1);
      return;
    }

    inFlight.current = true;
    setStatus("submitting");
    try {
      await options.onSubmit(parsed.data);
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      if (isApiRequestError(error)) {
        if (error.fields && Object.keys(error.fields).length > 0) {
          setServerErrors(error.fields);
          setAttempts((n) => n + 1);
        } else {
          setFormError(error);
          // A rejected attempt should not leave a secret sitting in the form; a lost connection should (retry is one click).
          if (error.code !== "NETWORK" && error.code !== "RATE_LIMITED" && options.clearOnError?.length) {
            setValues((prev) => ({ ...prev, ...Object.fromEntries(options.clearOnError!.map((name) => [name, ""])) }));
          }
        }
      } else {
        throw error;
      }
    } finally {
      inFlight.current = false;
    }
  }

  return {
    formRef,
    values,
    setValue,
    dismiss,
    field,
    errorKey,
    status,
    formError,
    /** Re-submits the current values (the "Try again" action after a network failure). */
    retry: () => formRef.current?.requestSubmit(),
    /** True once a submit was attempted: the password checklist uses it to flag unmet rules. */
    submitted,
    handleSubmit,
  };
}
