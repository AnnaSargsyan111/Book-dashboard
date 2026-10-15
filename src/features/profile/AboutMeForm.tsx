"use client";

import { Pencil, Tags, PenLine as WriteIcon, Users } from "lucide-react";
import { useMemo, useRef, useState, type ComponentType } from "react";
import { useTranslations } from "next-intl";
import { ApiRequestError, isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { GENRE_KEYS } from "@/shared/genres";
import { LIMITS } from "@/shared/validation/limits";
import { VALIDATION_KEYS } from "@/shared/validation/keys";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/shared/validation/profile";
import { Button, type ButtonState } from "@/ui/Button";
import { ChipInput } from "@/ui/ChipInput";
import { FormAlert } from "@/ui/FormAlert";
import { MultiSelect } from "@/ui/MultiSelect";
import { TextArea } from "@/ui/TextArea";
import { useToast } from "@/ui/toast/ToastProvider";
import { profileApi } from "./api";

/** One editorial section's header: icon, serif title, one-line description, and a small edit affordance that
 *  moves focus into the section's own control rather than toggling some separate "edit mode" — every field here
 *  is always editable, the same dirty-tracked-Save pattern as the rest of the app. */
function SectionHeader({ icon: Icon, title, description, onEdit, editLabel }: { icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>; title: string; description: string; onEdit: () => void; editLabel: string }) {
  return (
    <div className="flex items-start justify-between gap-4 pb-5 pt-8">
      <div className="flex items-start gap-3.5">
        <span className="profile-section-icon mt-0.5">
          <Icon className="size-[1.125rem]" strokeWidth={1.6} aria-hidden={true} />
        </span>
        <div>
          <h2 className="font-display text-[1.375rem] leading-snug">{title}</h2>
          <p className="mt-1 text-[0.9375rem] text-muted">{description}</p>
        </div>
      </div>
      <button type="button" onClick={onEdit} aria-label={editLabel} className="profile-edit-btn size-9 shrink-0">
        <Pencil className="size-4" strokeWidth={1.6} aria-hidden="true" />
      </button>
    </div>
  );
}

function focusFirst(container: HTMLDivElement | null) {
  container?.querySelector<HTMLElement>("input, textarea, button")?.focus();
}

/** The form's own working shape: plain `string[]` for genres (like the onboarding form), narrowed to `GenreKey[]`
 *  only once Zod parses it on save — so the UI never needs to cast what a widget hands back. */
interface FormValues {
  genres: string[];
  favoriteAuthors: string[];
  aboutMe: string;
}
type Field = keyof FormValues;
type SaveStatus = "idle" | "saving" | "success";

/** How long the button flashes its success check before settling back (it will show as "nothing to save" from
 *  then on, since saving the current values makes the form clean again). */
const SUCCESS_FLASH_MS = 1400;

/**
 * The editable "About Me" profile: the answers from onboarding, now editable and fully clearable. Unlike the
 * onboarding form, this one tracks whether anything has actually changed since the last save (`dirty`) and the
 * Save button reflects that directly, rather than a form that is simply submitted once.
 */
export function AboutMeForm({ initial }: { initial: ProfileUpdateInput }) {
  const t = useTranslations("aboutMe");
  const ts = useTranslations("aboutMe.sections");
  const tf = useTranslations("onboarding.fields");
  const to = useTranslations("onboarding");
  const tg = useTranslations("genres");
  const tc = useTranslations("common");
  const tk = useTranslateKey();
  const { show: showToast } = useToast();

  const [saved, setSaved] = useState<FormValues>(initial);
  const [values, setValues] = useState<FormValues>(initial);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [genreLimit, setGenreLimit] = useState(false);
  const [authorReject, setAuthorReject] = useState<"tooLong" | "tooMany" | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [formError, setFormError] = useState<ApiRequestError | null>(null);
  const inFlight = useRef(false);
  const genreRef = useRef<HTMLDivElement>(null);
  const authorsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const schemaErrors = useMemo(() => {
    const result = profileUpdateSchema.safeParse(values);
    return result.success ? {} : fieldErrorKeys(result.error);
  }, [values]);

  function setField<K extends Field>(name: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function touch(name: Field) {
    setTouched((prev) => ({ ...prev, [name]: false }));
  }

  async function handleSave() {
    if (!dirty || inFlight.current) return;
    const parsed = profileUpdateSchema.safeParse(values);
    if (!parsed.success) {
      setTouched({ genres: true, favoriteAuthors: true, aboutMe: true });
      return;
    }

    inFlight.current = true;
    setStatus("saving");
    setFormError(null);
    try {
      const { profile } = await profileApi.update(parsed.data);
      // The saved values become the new baseline: the form is clean again, and shows exactly what was persisted.
      setSaved(profile);
      setValues(profile);
      setTouched({});
      setStatus("success");
      showToast(t("toast"));
      setTimeout(() => setStatus((s) => (s === "success" ? "idle" : s)), SUCCESS_FLASH_MS);
    } catch (error) {
      setStatus("idle");
      if (isApiRequestError(error)) setFormError(error);
      else throw error;
    } finally {
      inFlight.current = false;
    }
  }

  const authorErrorKey = authorReject === "tooLong" ? VALIDATION_KEYS.authorTooLong : authorReject === "tooMany" ? VALIDATION_KEYS.tooManyAuthors : undefined;
  const genreOptions = GENRE_KEYS.map((key) => ({ value: key, label: tg(key) }));
  const buttonState: ButtonState = status === "saving" ? "loading" : status === "success" ? "success" : "idle";

  return (
    <div className="flex flex-col">
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

      <div className="profile-section">
        <SectionHeader
          icon={Tags}
          title={ts("genre.title")}
          description={ts("genre.description", { genresMax: LIMITS.genresMax })}
          onEdit={() => focusFirst(genreRef.current)}
          editLabel={t("editSection", { section: ts("genre.title") })}
        />
        <div ref={genreRef} className="pb-7">
          <MultiSelect
            label={tf("genre.label")}
            hideLabel
            name="genres"
            placeholder={tf("genre.placeholder", { genresMax: LIMITS.genresMax })}
            summary={(count) => tf("genre.selected", { count, genresMax: LIMITS.genresMax })}
            listLabel={tf("genre.listLabel")}
            options={genreOptions}
            value={values.genres}
            onChange={(next) => {
              setGenreLimit(false);
              setField("genres", next);
            }}
            max={LIMITS.genresMax}
            onLimit={() => setGenreLimit(true)}
            onLeave={() => {
              setGenreLimit(false);
              touch("genres");
            }}
            error={genreLimit ? tk(VALIDATION_KEYS.maxGenres) : touched.genres ? tk(schemaErrors.genres) : undefined}
            removeLabel={(name) => tf("genre.remove", { name })}
          />
        </div>
      </div>

      <div className="profile-section">
        <SectionHeader
          icon={Users}
          title={ts("authors.title")}
          description={ts("authors.description")}
          onEdit={() => focusFirst(authorsRef.current)}
          editLabel={t("editSection", { section: ts("authors.title") })}
        />
        <div ref={authorsRef} className="pb-7">
          <ChipInput
            label={tf("authors.label")}
            hideLabel
            name="favoriteAuthors"
            placeholder={tf("authors.placeholder")}
            hint={tf("authors.hint")}
            value={values.favoriteAuthors}
            onChange={(next) => {
              setAuthorReject(null);
              setField("favoriteAuthors", next);
            }}
            onReject={setAuthorReject}
            onEdit={() => setAuthorReject(null)}
            onLeave={() => touch("favoriteAuthors")}
            maxItems={LIMITS.authorsMax}
            maxLength={LIMITS.authorMax}
            error={tk(authorErrorKey ?? (touched.favoriteAuthors ? schemaErrors.favoriteAuthors : undefined))}
            removeLabel={(name) => tf("authors.remove", { name })}
          />
        </div>
      </div>

      <div className="profile-section">
        <SectionHeader
          icon={WriteIcon}
          title={ts("about.title")}
          description={ts("about.description")}
          onEdit={() => focusFirst(aboutRef.current)}
          editLabel={t("editSection", { section: ts("about.title") })}
        />
        <div ref={aboutRef} className="pb-7">
          <TextArea
            label={tf("about.label")}
            hideLabel
            placeholder={tf("about.placeholder")}
            counter={tf("about.counter", { count: values.aboutMe.length, max: LIMITS.aboutMax })}
            name="aboutMe"
            value={values.aboutMe}
            onChange={(e) => setField("aboutMe", e.target.value)}
            onBlur={() => touch("aboutMe")}
            error={touched.aboutMe ? tk(schemaErrors.aboutMe) : undefined}
          />
        </div>
      </div>

      <div className="pt-8">
        <Button onClick={handleSave} disabled={!dirty} state={buttonState} successLabel={to("success")}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
