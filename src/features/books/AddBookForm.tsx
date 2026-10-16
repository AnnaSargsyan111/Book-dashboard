"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ApiRequestError, isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { GENRE_KEYS } from "@/shared/genres";
import { bookDetailPath, ROUTES } from "@/shared/routes";
import { LIMITS } from "@/shared/validation/limits";
import { bookSchema, type BookStatus } from "@/shared/validation/book";
import { Button, type ButtonState } from "@/ui/Button";
import { ChipInput } from "@/ui/ChipInput";
import { FormAlert } from "@/ui/FormAlert";
import { MultiSelect } from "@/ui/MultiSelect";
import { Select } from "@/ui/Select";
import { StarRating } from "@/ui/StarRating";
import { TextArea } from "@/ui/TextArea";
import { TextField } from "@/ui/TextField";
import { booksApi } from "./api";
import { emptyQuote, QuotesEditor, type QuoteDraft } from "./QuotesEditor";
import { mysteryApi } from "@/features/mystery/api";
import { useToast } from "@/ui/toast/ToastProvider";

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

const blankValues: FormValues = {
  title: "",
  author: "",
  status: "",
  rating: null,
  genres: [],
  plot: "",
  characters: [],
  quotes: [],
  commentary: "",
};

/** The Status field's rating rule, applied once here rather than scattered: a rating is only ever sent when
 *  Status is "read" — the star widget itself stays visible-but-inactive for the other three the whole time. */
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

/** "Add book": every field from the spec, a tappable half-star Rating that is required only when Status is
 *  "Read", and a "Fill with AI" button that only ever fills in fields the person hasn't already typed something
 *  into. `fromViewId` + `initialValues` are only ever passed when this form was reached from Mystery Book →
 *  Recently Recommended → "+ Add" (see app/books/new/page.tsx) — title/author/genre arrive pre-filled from that
 *  recommendation's real catalog book, and Save links the new entry back to it instead of posting the plain form. */
export function AddBookForm({ fromViewId, initialValues }: { fromViewId?: string; initialValues?: Partial<Pick<FormValues, "title" | "author" | "genres">> } = {}) {
  const t = useTranslations("books.add");
  const tf = useTranslations("books.add.fields");
  const tai = useTranslations("books.add.ai");
  const tc = useTranslations("common");
  const tg = useTranslations("genres");
  const tk = useTranslateKey();
  const router = useRouter();

  const { show: showToast } = useToast();
  // A book picked from Recently Recommended has, by definition, been read (it is already on a shelf with a cover),
  // so Status starts on "Read" there — still changeable like any other value.
  const [values, setValues] = useState<FormValues>({ ...blankValues, ...(fromViewId ? { status: "read" as const } : {}), ...initialValues });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [genreReject, setGenreReject] = useState<"tooLong" | "tooMany" | null>(null);
  const [characterReject, setCharacterReject] = useState<"tooLong" | "tooMany" | null>(null);
  const [saveState, setSaveState] = useState<ButtonState>("idle");
  const [formError, setFormError] = useState<ApiRequestError | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const inFlight = useRef(false);

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

  async function handleAiFill() {
    if (aiBusy) return;
    const title = values.title.trim();
    if (!title) {
      setTouched((p) => ({ ...p, title: true }));
      return;
    }
    setAiBusy(true);
    setAiError(null);
    try {
      const result = await booksApi.aiFill({ title, author: values.author.trim() || undefined });
      setValues((v) => ({
        ...v,
        author: v.author.trim() ? v.author : (result.author ?? v.author),
        genres: v.genres.length ? v.genres : dedupe([...v.genres, ...result.genres]),
        characters: v.characters.length ? v.characters : dedupe([...v.characters, ...result.characters]),
        plot: v.plot.trim() ? v.plot : (result.plot ?? v.plot),
      }));
    } catch (error) {
      if (isApiRequestError(error)) setAiError(tk(error.messageKey) ?? null);
      else throw error;
    } finally {
      setAiBusy(false);
    }
  }

  async function handleSave() {
    if (inFlight.current) return;
    const parsed = bookSchema.safeParse(toPayload(values));
    if (!parsed.success) {
      setTouched({ title: true, author: true, status: true, rating: true, genres: true, characters: true, quotes: true, plot: true, commentary: true });
      return;
    }
    inFlight.current = true;
    setSaveState("loading");
    setFormError(null);
    try {
      const { book: created } = fromViewId ? await mysteryApi.addToLibrary(fromViewId, parsed.data) : await booksApi.create(parsed.data);
      if (fromViewId) {
        // The recommendation already carries its cover (see createBook), so there is nothing left to do on Book
        // Detail: go straight to the library, where the new book is, and confirm with a toast.
        showToast(t("toast"));
        router.replace(ROUTES.books);
      } else {
        // Straight to Book Detail: the cover (Add Photo / Find Cover) only lives there, and this is the
        // natural next thing to do right after adding a book.
        router.replace(bookDetailPath(created.id));
      }
    } catch (error) {
      setSaveState("idle");
      if (isApiRequestError(error)) setFormError(error);
      else throw error;
    } finally {
      inFlight.current = false;
    }
  }

  const genreErrorKey = genreReject === "tooLong" ? "validation.genreTagTooLong" : genreReject === "tooMany" ? "validation.tooManyGenres" : undefined;
  const characterErrorKey = characterReject === "tooLong" ? "validation.characterTooLong" : characterReject === "tooMany" ? "validation.tooManyCharacters" : undefined;

  return (
    <div className="mt-9 flex flex-col gap-7">
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

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label={tf("author.label")}
          placeholder={tf("author.placeholder")}
          value={values.author}
          onChange={(e) => setField("author", e.target.value)}
          onBlur={() => touch("author")}
          error={errorFor("author")}
        />
        <TextField
          label={tf("title.label")}
          placeholder={tf("title.placeholder")}
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          onBlur={() => touch("title")}
          error={errorFor("title")}
        />
      </div>

      <div className="rounded-2xl border border-dashed border-rule-strong p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-marker text-[color:var(--marker-ink)]">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <p className="max-w-[42ch] text-[0.9375rem] leading-relaxed text-muted">{tai("hint")}</p>
          </div>
          <Button variant="secondary" onClick={handleAiFill} state={aiBusy ? "loading" : "idle"}>
            {tai("button")}
          </Button>
        </div>
        {aiError ? <p className="mt-3 text-[0.9375rem] text-danger">{aiError}</p> : null}
      </div>

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

      <TextArea label={tf("plot.label")} placeholder={tf("plot.placeholder")} value={values.plot} onChange={(e) => setField("plot", e.target.value)} rows={5} />

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

      <TextArea label={tf("commentary.label")} placeholder={tf("commentary.placeholder")} value={values.commentary} onChange={(e) => setField("commentary", e.target.value)} rows={2} className="min-h-0!" />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button onClick={handleSave} state={saveState}>
          {t("save")}
        </Button>
        <Button variant="secondary" onClick={() => router.push(fromViewId ? ROUTES.mysteryBook : ROUTES.books)} disabled={saveState !== "idle"}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
