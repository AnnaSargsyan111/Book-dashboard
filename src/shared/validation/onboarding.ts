import { z } from "zod";
import { GENRE_KEYS } from "@/shared/genres";
import { LIMITS } from "./limits";
import { VALIDATION_KEYS as K } from "./keys";

/** Collapse inner whitespace so "  Ursula   K. Le Guin " and "Ursula K. Le Guin" are the same author. */
export const normalizeAuthor = (name: string) => name.trim().replace(/\s+/g, " ");

/** Case-insensitive de-duplication that keeps the first spelling and the original order. */
export function dedupeAuthors(names: string[]): string[] {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Any language or script is accepted for authors and About Me: no character restrictions on purpose.
const authorField = z
  .string()
  .transform(normalizeAuthor)
  .pipe(z.string().min(1).max(LIMITS.authorMax, { error: K.authorTooLong }));

/** Genre and Favorite Authors are optional everywhere they appear (onboarding, and later the About Me page). */
export const genresField = z
  .array(z.enum(GENRE_KEYS))
  .max(LIMITS.genresMax, { error: K.maxGenres })
  .transform((keys) => [...new Set(keys)]);

export const authorsField = z
  .array(authorField)
  .max(LIMITS.authorsMax, { error: K.tooManyAuthors })
  .transform(dedupeAuthors);

/**
 * The "Tell us about yourself" answers. Genre and Favorite Authors are optional (an empty list is valid);
 * About Me is the only required field here (the About Me *page*, later, allows clearing it — see
 * `shared/validation/profile.ts`). Names (first/last) are NOT here: they come from the account, read-only.
 */
export const onboardingSchema = z
  .object({
    genres: genresField,
    favoriteAuthors: authorsField,
    aboutMe: z
      .string({ error: K.required })
      .transform((text) => text.replace(/\r\n/g, "\n").trim())
      .pipe(
        z
          .string()
          .min(1, { error: K.required, abort: true })
          .max(LIMITS.aboutMax, { error: K.aboutTooLong }),
      ),
  })
  .strict();

export type OnboardingInput = z.infer<typeof onboardingSchema>;
