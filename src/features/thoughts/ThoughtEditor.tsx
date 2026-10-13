"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ApiRequestError, isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { LIMITS } from "@/shared/validation/limits";
import { ROUTES } from "@/shared/routes";
import { thoughtSchema, type ThoughtDTO } from "@/shared/validation/thought";
import { Button, type ButtonState } from "@/ui/Button";
import { FormAlert } from "@/ui/FormAlert";
import { TextArea } from "@/ui/TextArea";
import { TextField } from "@/ui/TextField";
import { useToast } from "@/ui/toast/ToastProvider";
import { thoughtsApi } from "./api";
import { BookPicker } from "./BookPicker";
import { DeleteThoughtButton } from "./DeleteThoughtButton";

export interface BookOption {
  id: string;
  title: string;
  author: string;
}

interface FormValues {
  title: string;
  text: string;
  bookId: string | null;
  favorite: boolean;
}

function toFormValues(thought?: ThoughtDTO): FormValues {
  return {
    title: thought?.title ?? "",
    text: thought?.text ?? "",
    bookId: thought?.book?.id ?? null,
    favorite: thought?.favorite ?? false,
  };
}

function toPayload(v: FormValues) {
  return { title: v.title, text: v.text, bookId: v.bookId, favorite: v.favorite };
}

type Field = keyof FormValues;

/**
 * The whole writing experience — new and existing thoughts alike, since a thought has no separate edit mode
 * (same rule as Book Detail). `thought` present = editing in place with "Save Changes" + Delete; absent = a
 * fresh capture with "Save Thought" + Cancel, landing on the new thought's own page once saved.
 */
export function ThoughtEditor({ thought, books }: { thought?: ThoughtDTO; books: BookOption[] }) {
  const t = useTranslations("thoughts");
  const tf = useTranslations("thoughts.fields");
  const tc = useTranslations("common");
  const tk = useTranslateKey();
  const router = useRouter();
  const { show: showToast } = useToast();

  const isEdit = Boolean(thought);
  const initial = useMemo(() => toFormValues(thought), [thought]);
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [showBookPicker, setShowBookPicker] = useState(Boolean(initial.bookId));
  const [saveState, setSaveState] = useState<ButtonState>("idle");
  const [formError, setFormError] = useState<ApiRequestError | null>(null);
  const inFlight = useRef(false);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const schemaErrors = useMemo(() => {
    const result = thoughtSchema.safeParse(toPayload(values));
    return result.success ? {} : fieldErrorKeys(result.error);
  }, [values]);

  function setField<K extends Field>(name: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [name]: value }));
  }
  function touch(name: Field) {
    setTouched((p) => ({ ...p, [name]: false }));
  }
  const errorFor = (name: Field) => (touched[name] ? tk(schemaErrors[name]) : undefined);

  const selectedBook = values.bookId ? books.find((b) => b.id === values.bookId) : undefined;

  async function handleSave() {
    if (isEdit && !dirty) return;
    if (inFlight.current) return;
    const parsed = thoughtSchema.safeParse(toPayload(values));
    if (!parsed.success) {
      setTouched({ title: true, text: true, bookId: true, favorite: true });
      return;
    }
    inFlight.current = true;
    setSaveState("loading");
    setFormError(null);
    try {
      if (isEdit && thought) {
        const { thought: updated } = await thoughtsApi.update(thought.id, parsed.data);
        const next = toFormValues(updated);
        setSaved(next);
        setValues(next);
        setTouched({});
        setSaveState("success");
        showToast(t("detail.toast"));
        setTimeout(() => setSaveState((s) => (s === "success" ? "idle" : s)), 650);
      } else {
        await thoughtsApi.create(parsed.data);
        showToast(t("new.toast"));
        // Straight back to the collection — the new entry is the first card there (newest first), so saving
        // reads as "it's captured" rather than dropping the person into another editing screen.
        router.replace(ROUTES.thoughts);
      }
    } catch (error) {
      setSaveState("idle");
      if (isApiRequestError(error)) setFormError(error);
      else throw error;
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <div className="mt-9 flex flex-col gap-7">
      {isEdit ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={ROUTES.thoughts} className="w-fit text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            {t("detail.back")}
          </Link>
          <Link href={ROUTES.newThought} className="w-fit text-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline">
            {t("newCta")}
          </Link>
        </div>
      ) : null}

      <FormAlert
        action={
          formError?.code === "NETWORK" ? (
            <button type="button" onClick={handleSave} className="underline underline-offset-4">
              {tc("retry")}
            </button>
          ) : null
        }
      >
        {formError ? tk(formError.messageKey) : null}
      </FormAlert>

      <TextField
        label={tf("title.label")}
        tag={t("optional")}
        placeholder={tf("title.placeholder")}
        value={values.title}
        onChange={(e) => setField("title", e.target.value)}
        onBlur={() => touch("title")}
        error={errorFor("title")}
        className="font-display text-lg"
      />

      <TextArea
        label={tf("text.label")}
        placeholder={tf("text.placeholder")}
        value={values.text}
        onChange={(e) => setField("text", e.target.value)}
        onBlur={() => touch("text")}
        error={errorFor("text")}
        rows={14}
        className="min-h-[16rem] font-display text-[1.0625rem] leading-relaxed"
        counter={`${values.text.length} / ${LIMITS.thoughtTextMax}`}
      />

      <div>
        {showBookPicker ? (
          <BookPicker
            label={tf("book.label")}
            placeholder={tf("book.placeholder")}
            noneLabel={tf("book.none")}
            books={books}
            value={values.bookId}
            onChange={(bookId) => setField("bookId", bookId)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowBookPicker(true)}
            className="text-[0.9375rem] font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline"
          >
            {tf("book.addCta")}
          </button>
        )}
        {selectedBook ? (
          <p className="mt-2 text-[0.9375rem] text-muted">
            {tf("book.inspiredBy")} <span className="text-ink">{selectedBook.title} — {selectedBook.author}</span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={isEdit && !dirty}
            state={saveState}
            loadingLabel={isEdit ? t("detail.saving") : undefined}
            successLabel={isEdit ? t("detail.saved") : undefined}
          >
            {t(isEdit ? "detail.save" : "new.save")}
          </Button>
          {!isEdit ? (
            <Button variant="secondary" onClick={() => router.push(ROUTES.thoughts)} disabled={saveState !== "idle"}>
              {t("new.cancel")}
            </Button>
          ) : null}
        </div>
        {isEdit && thought ? <DeleteThoughtButton id={thought.id} variant="button" redirectTo={ROUTES.thoughts} /> : null}
      </div>
    </div>
  );
}
