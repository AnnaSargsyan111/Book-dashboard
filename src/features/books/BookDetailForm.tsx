"use client";

import { ImagePlus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { ApiRequestError, isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { GENRE_KEYS } from "@/shared/genres";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { bookSchema, COVER_MIME_TYPES, type BookDTO, type BookStatus } from "@/shared/validation/book";
import { LIMITS } from "@/shared/validation/limits";
import { Button, type ButtonState } from "@/ui/Button";
import { ChipInput } from "@/ui/ChipInput";
import { CoverImage } from "@/ui/CoverImage";
import { FormAlert } from "@/ui/FormAlert";
import { MultiSelect } from "@/ui/MultiSelect";
import { Select } from "@/ui/Select";
import { StarRating } from "@/ui/StarRating";
import { TextArea } from "@/ui/TextArea";
import { TextField } from "@/ui/TextField";
import { useToast } from "@/ui/toast/ToastProvider";
import { booksApi } from "./api";
import { DeleteBookButton } from "./DeleteBookButton";
import { QuotesEditor, type QuoteDraft } from "./QuotesEditor";

interface FormValues {
  title: string;
  author: string;
  status: BookStatus | "";
  rating: number | null;
  genres: string[];
  plot: string;
  characters: string[];
  quotes: QuoteDraft[];
  commentary: string;
}

function toFormValues(book: BookDTO): FormValues {
  return {
    title: book.title,
    author: book.author,
    status: book.status,
    rating: book.rating,
    genres: book.genres,
    plot: book.plot ?? "",
    characters: book.characters,
    quotes: book.quotes.length ? book.quotes.map((q) => ({ text: q.text, page: q.page != null ? String(q.page) : "" })) : [],
    commentary: book.commentary ?? "",
  };
}

/** Same rule as Add Book: a rating is only ever sent when Status is "read". */
function toPayload(v: FormValues) {
  return {
    title: v.title,
    author: v.author,
    status: v.status,
    rating: v.status === "read" ? v.rating : null,
    genres: v.genres,
    plot: v.plot,
    characters: v.characters,
    quotes: v.quotes.filter((q) => q.text.trim().length > 0).map((q) => ({ text: q.text, page: q.page ? Number(q.page) : null })),
    commentary: v.commentary,
  };
}

type Field = keyof FormValues;
type CoverBusy = "idle" | "uploading" | "finding";

/**
 * Book Detail: every field from Add Book, editable in place — no separate edit mode, just a Save Changes button
 * that only does anything once something has actually changed (same dirty-tracked pattern as About Me and
 * Settings' Account form). The cover (Add Photo / Find Cover) is handled independently: each commits to the
 * server the moment it succeeds, since it isn't one of the fields the schema validates as a set.
 */
export function BookDetailForm({ book, backHref, booksHref }: { book: BookDTO; backHref: string; booksHref: string }) {
  const t = useTranslations("books.detail");
  const tf = useTranslations("books.add.fields");
  const tc = useTranslations("common");
  const tg = useTranslations("genres");
  const tk = useTranslateKey();
  const { show: showToast } = useToast();

  const initial = useMemo(() => toFormValues(book), [book]);
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [genreReject, setGenreReject] = useState<"tooLong" | "tooMany" | null>(null);
  const [characterReject, setCharacterReject] = useState<"tooLong" | "tooMany" | null>(null);
  const [saveState, setSaveState] = useState<ButtonState>("idle");
  const [formError, setFormError] = useState<ApiRequestError | null>(null);
  const inFlight = useRef(false);

  const [coverUrl, setCoverUrl] = useState(book.coverUrl);
  const [coverBusy, setCoverBusy] = useState<CoverBusy>("idle");
  const [coverError, setCoverError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const schemaErrors = useMemo(() => {
    const result = bookSchema.safeParse(toPayload(values));
    return result.success ? {} : fieldErrorKeys(result.error);
  }, [values]);

  const genreOptions = useMemo(() => GENRE_KEYS.map((key) => ({ value: tg(key), label: tg(key) })), [tg]);

  function setField<K extends Field>(name: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [name]: value }));
  }
  function touch(name: Field) {
    setTouched((p) => ({ ...p, [name]: false }));
  }
  const errorFor = (name: Field) => (touched[name] ? tk(schemaErrors[name]) : undefined);

  async function handleSave() {
    if (!dirty || inFlight.current) return;
    const parsed = bookSchema.safeParse(toPayload(values));
    if (!parsed.success) {
      setTouched({ title: true, author: true, status: true, rating: true, genres: true, characters: true, quotes: true, plot: true, commentary: true });
      return;
    }
    inFlight.current = true;
    setSaveState("loading");
    setFormError(null);
    try {
      const { book: updated } = await booksApi.update(book.id, parsed.data);
      const next = toFormValues(updated);
      setSaved(next);
      setValues(next);
      setTouched({});
      setSaveState("success");
      showToast(t("toast"));
      setTimeout(() => setSaveState((s) => (s === "success" ? "idle" : s)), 650);
    } catch (error) {
      setSaveState("idle");
      if (isApiRequestError(error)) setFormError(error);
      else throw error;
    } finally {
      inFlight.current = false;
    }
  }

  function precheckFile(file: File): string | null {
    if (!(COVER_MIME_TYPES as readonly string[]).includes(file.type)) return "books.detail.cover.invalidType";
    if (file.size > LIMITS.bookCoverMaxBytes) return "books.detail.cover.tooLarge";
    return null;
  }

  async function handleFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || coverBusy !== "idle") return;

    const precheck = precheckFile(file);
    if (precheck) {
      setCoverError(tk(precheck) ?? null);
      return;
    }

    setCoverBusy("uploading");
    setCoverError(null);
    try {
      const { book: updated } = await booksApi.uploadCover(book.id, file);
      setCoverUrl(updated.coverUrl);
      showToast(t("cover.added"));
    } catch (error) {
      if (isApiRequestError(error)) setCoverError(tk(error.messageKey) ?? null);
      else throw error;
    } finally {
      setCoverBusy("idle");
    }
  }

  async function handleFindCover() {
    if (coverBusy !== "idle") return;
    setCoverBusy("finding");
    setCoverError(null);
    try {
      const { book: updated } = await booksApi.findCover(book.id);
      setCoverUrl(updated.coverUrl);
      showToast(t("cover.found"));
    } catch (error) {
      if (isApiRequestError(error)) setCoverError(tk(error.messageKey) ?? null);
      else throw error;
    } finally {
      setCoverBusy("idle");
    }
  }

  const genreErrorKey = genreReject === "tooLong" ? "validation.genreTagTooLong" : genreReject === "tooMany" ? "validation.tooManyGenres" : undefined;
  const characterErrorKey = characterReject === "tooLong" ? "validation.characterTooLong" : characterReject === "tooMany" ? "validation.tooManyCharacters" : undefined;

  return (
    <div className="mt-9 flex flex-col gap-8">
      <a href={backHref} className="w-fit text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
        {t("back")}
      </a>

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

      <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:items-start xl:grid-cols-[18rem_1fr]">
        <div className="mx-auto w-full max-w-[16rem] lg:sticky lg:top-24 lg:mx-0 xl:max-w-[18rem]">
          <CoverImage src={coverUrl} title={values.title || book.title} alt="" />
          <div className="mt-4 flex flex-col gap-2.5">
            <input ref={fileInputRef} type="file" accept={COVER_MIME_TYPES.join(",")} className="hidden" onChange={handleFileChosen} />
            <Button variant="secondary" block onClick={() => fileInputRef.current?.click()} state={coverBusy === "uploading" ? "loading" : "idle"}>
              <ImagePlus className="size-[1.0625rem]" aria-hidden="true" />
              {t("cover.addPhoto")}
            </Button>
            <Button variant="secondary" block onClick={handleFindCover} state={coverBusy === "finding" ? "loading" : "idle"}>
              <Search className="size-[1.0625rem]" aria-hidden="true" />
              {t("cover.findCover")}
            </Button>
            {coverError ? <p className="text-sm text-danger">{coverError}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-7">
          <TextField
            label={tf("title.label")}
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            onBlur={() => touch("title")}
            error={errorFor("title")}
            className="font-display text-lg"
          />
          <TextField
            label={tf("author.label")}
            value={values.author}
            onChange={(e) => setField("author", e.target.value)}
            onBlur={() => touch("author")}
            error={errorFor("author")}
          />

          <div className="grid gap-5 sm:grid-cols-2 sm:items-start">
            <Select
              label={tf("status.label")}
              placeholder={tf("status.placeholder")}
              value={values.status}
              onChange={(next) => {
                const nextStatus = next as BookStatus;
                setField("status", nextStatus);
                touch("status");
              }}
              onBlur={() => touch("status")}
              options={[
                { value: "want_to_read", label: tf("status.wantToRead") },
                { value: "currently_reading", label: tf("status.currentlyReading") },
                { value: "read", label: tf("status.read") },
                { value: "did_not_finish", label: tf("status.didNotFinish") },
              ]}
              error={errorFor("status")}
            />

            <div>
              <p className="mb-1.5 text-sm font-medium text-ink-2">{tf("rating.label")}</p>
              <div className="flex h-[3.125rem] items-center">
                <StarRating
                  label={tf("rating.label")}
                  value={values.rating}
                  disabled={values.status !== "read"}
                  onChange={(next) => {
                    setField("rating", next);
                    touch("rating");
                  }}
                />
              </div>
              {errorFor("rating") ? <p className="pt-1.5 text-sm text-danger">{errorFor("rating")}</p> : null}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-2">{tf("genre.label")}</p>
            <p className="mb-3 text-sm text-muted">{tf("genre.hint")}</p>
            <div className="flex flex-col gap-3">
              <MultiSelect
                label={tf("genre.label")}
                hideLabel
                hideChips
                name="genres"
                placeholder={tf("genre.selectPlaceholder")}
                summary={(count) => tf("genre.selected", { count, genresMax: LIMITS.bookGenresMax })}
                listLabel={tf("genre.listLabel")}
                options={genreOptions}
                value={values.genres}
                onChange={(next) => {
                  setGenreReject(null);
                  setField("genres", next);
                }}
                max={LIMITS.bookGenresMax}
                onLimit={() => setGenreReject("tooMany")}
                onLeave={() => touch("genres")}
                removeLabel={(name) => tf("genre.remove", { name })}
              />
              <ChipInput
                label=""
                name="genres"
                placeholder={tf("genre.placeholder")}
                value={values.genres}
                onChange={(next) => {
                  setGenreReject(null);
                  setField("genres", next);
                }}
                onReject={setGenreReject}
                onEdit={() => setGenreReject(null)}
                onLeave={() => touch("genres")}
                maxItems={LIMITS.bookGenresMax}
                maxLength={LIMITS.bookGenreMax}
                error={tk(genreErrorKey ?? (touched.genres ? schemaErrors.genres : undefined))}
                removeLabel={(name) => tf("genre.remove", { name })}
              />
            </div>
          </div>

          <TextArea label={tf("plot.label")} value={values.plot} onChange={(e) => setField("plot", e.target.value)} rows={5} />

          <ChipInput
            label={tf("characters.label")}
            name="characters"
            placeholder={tf("characters.placeholder")}
            value={values.characters}
            onChange={(next) => {
              setCharacterReject(null);
              setField("characters", next);
            }}
            onReject={setCharacterReject}
            onEdit={() => setCharacterReject(null)}
            onLeave={() => touch("characters")}
            maxItems={LIMITS.charactersMax}
            maxLength={LIMITS.characterMax}
            error={tk(characterErrorKey ?? (touched.characters ? schemaErrors.characters : undefined))}
            removeLabel={(name) => tf("characters.remove", { name })}
          />

          <div>
            <p className="mb-3 text-sm font-medium text-ink-2">{tf("quotes.label")}</p>
            <QuotesEditor
              value={values.quotes}
              onChange={(next) => setField("quotes", next)}
              labels={{
                quote: (n) => tf("quotes.quote", { number: n }),
                page: tf("quotes.page"),
                add: tf("quotes.add"),
                remove: tf("quotes.remove"),
              }}
            />
          </div>

          <TextArea label={tf("commentary.label")} value={values.commentary} onChange={(e) => setField("commentary", e.target.value)} rows={2} className="min-h-0!" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6 lg:pl-[calc(16rem+2.5rem)] xl:pl-[calc(18rem+2.5rem)]">
        <Button onClick={handleSave} disabled={!dirty} state={saveState} successLabel={t("saved")}>
          {t("save")}
        </Button>
        <DeleteBookButton id={book.id} title={values.title} redirectTo={booksHref} variant="button" />
      </div>
    </div>
  );
}
