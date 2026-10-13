import { z } from "zod";
import { authorsField, genresField } from "./onboarding";
import { LIMITS } from "./limits";
import { VALIDATION_KEYS as K } from "./keys";

/**
 * The editable About Me profile (the answers from "Tell us about yourself", now editable and fully clearable).
 * Unlike `onboardingSchema`, About Me has NO minimum here: this is a profile page, not a second onboarding, so
 * every field — including About Me itself — is allowed to be empty. Genre and Favorite Authors reuse onboarding's
 * field schemas as-is (same limits, same normalization), since they are the same data.
 */
export const profileUpdateSchema = z
  .object({
    genres: genresField,
    favoriteAuthors: authorsField,
    aboutMe: z
      .string({ error: K.required })
      .transform((text) => text.replace(/\r\n/g, "\n").trim())
      .pipe(z.string().max(LIMITS.aboutMax, { error: K.aboutTooLong })),
  })
  .strict();

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
