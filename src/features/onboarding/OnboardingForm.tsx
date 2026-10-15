"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { isApiRequestError } from "@/lib/api/client";
import { useSchemaForm } from "@/lib/forms/useSchemaForm";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { GENRE_KEYS } from "@/shared/genres";
import { ROUTES } from "@/shared/routes";
import { LIMITS } from "@/shared/validation/limits";
import { VALIDATION_KEYS } from "@/shared/validation/keys";
import { onboardingSchema } from "@/shared/validation/onboarding";
import { Button } from "@/ui/Button";
import { ChipInput } from "@/ui/ChipInput";
import { FormAlert } from "@/ui/FormAlert";
import { MultiSelect } from "@/ui/MultiSelect";
import { TextArea } from "@/ui/TextArea";
import { onboardingApi } from "./api";
import { rearmBookIntro } from "@/lib/book-intro";
import { BookOpeningTransition } from "./BookOpeningTransition";

/**
 * "Tell us about yourself". Genre and Favorite Authors are optional; only an empty About Me blocks Continue.
 * The server validates everything again. (Name and surname are not asked here: they come from registration.)
 */
export function OnboardingForm() {
  const t = useTranslations("onboarding");
  const tf = useTranslations("onboarding.fields");
  const tg = useTranslations("genres");
  const tc = useTranslations("common");
  const tk = useTranslateKey();
  const router = useRouter();

  // Refusals from the two list fields (a 6th genre, an over-long author) are shown inline until the list changes.
  const [genreLimit, setGenreLimit] = useState(false);
  const [authorReject, setAuthorReject] = useState<"tooLong" | "tooMany" | null>(null);

  // The book-opening transition is a real animation, not a timer, so onSubmit awaits its onDone through this ref.
  const [entering, setEntering] = useState(false);
  const doneRef = useRef<(() => void) | undefined>(undefined);
  function playEntrance(): Promise<void> {
    return new Promise((resolve) => {
      doneRef.current = resolve;
      setEntering(true);
    });
  }

  const form = useSchemaForm({
    schema: onboardingSchema,
    initialValues: { genres: [] as string[], favoriteAuthors: [] as string[], aboutMe: "" },
    onSubmit: async (data) => {
      try {
        await onboardingApi.complete(data);
      } catch (error) {
        // Finished already (another tab, or a double submit): the gate is open, so just move on.
        if (isApiRequestError(error) && error.code === "ONBOARDING_ALREADY_COMPLETED") {
          router.replace(ROUTES.home);
          return;
        }
        throw error;
      }
      // The hub's closed-book entrance must play for a new reader even if this browser has seen it before.
      rearmBookIntro();
      await playEntrance();
      router.replace(ROUTES.home);
    },
  });

  const state = form.status === "idle" ? "idle" : form.status === "submitting" ? "loading" : "success";
  const authorErrorKey = authorReject === "tooLong" ? VALIDATION_KEYS.authorTooLong : authorReject === "tooMany" ? VALIDATION_KEYS.tooManyAuthors : undefined;
  const genreOptions = GENRE_KEYS.map((key) => ({ value: key, label: tg(key) }));

  return (
    <form
      method="post"
      ref={form.formRef}
      onSubmit={form.handleSubmit}
      noValidate
      aria-busy={form.status === "submitting"}
      className={`onboarding-form flex flex-col gap-6 transition-opacity duration-300 ${form.status === "success" ? "pointer-events-none opacity-70" : ""}`}
    >
      <FormAlert
        action={
          form.formError?.code === "NETWORK" ? (
            <button type="button" onClick={form.retry} className="underline underline-offset-4">
              {tc("retry")}
            </button>
          ) : null
        }
      >
        {tk(form.formError?.messageKey)}
      </FormAlert>

      <MultiSelect
        label={tf("genre.label")}
        tag={t("optional")}
        name="genres"
        placeholder={tf("genre.placeholder", { genresMax: LIMITS.genresMax })}
        summary={(count) => tf("genre.selected", { count, genresMax: LIMITS.genresMax })}
        listLabel={tf("genre.listLabel")}
        options={genreOptions}
        value={form.values.genres}
        onChange={(next) => {
          setGenreLimit(false);
          form.setValue("genres", next);
        }}
        max={LIMITS.genresMax}
        onLimit={() => setGenreLimit(true)}
        onLeave={() => {
          // The "too many" notice is a momentary refusal, not a lasting error: it goes when the list is closed.
          setGenreLimit(false);
          form.dismiss("genres");
        }}
        error={genreLimit ? tk(VALIDATION_KEYS.maxGenres) : tk(form.errorKey("genres"))}
        removeLabel={(name) => tf("genre.remove", { name })}
      />

      <ChipInput
        label={tf("authors.label")}
        tag={t("optional")}
        name="favoriteAuthors"
        placeholder={tf("authors.placeholder")}
        hint={tf("authors.hint")}
        value={form.values.favoriteAuthors}
        onChange={(next) => {
          setAuthorReject(null);
          form.setValue("favoriteAuthors", next);
        }}
        onReject={setAuthorReject}
        onEdit={() => setAuthorReject(null)}
        onLeave={() => form.dismiss("favoriteAuthors")}
        maxItems={LIMITS.authorsMax}
        maxLength={LIMITS.authorMax}
        error={tk(authorErrorKey ?? form.errorKey("favoriteAuthors"))}
        removeLabel={(name) => tf("authors.remove", { name })}
      />

      <TextArea
        label={tf("about.label")}
        placeholder={tf("about.placeholder")}
        counter={tf("about.counter", { count: form.values.aboutMe.length, max: LIMITS.aboutMax })}
        {...form.field("aboutMe")}
        error={tk(form.errorKey("aboutMe"))}
      />

      <Button type="submit" block state={state} successLabel={t("success")}>
        {t("continue")}
      </Button>

      {entering && (
        <BookOpeningTransition
          onDone={() => {
            const done = doneRef.current;
            doneRef.current = undefined;
            done?.();
          }}
        />
      )}
    </form>
  );
}
