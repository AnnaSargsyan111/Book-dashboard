import { z } from "zod";
import { LIMITS } from "./limits";
import { VALIDATION_KEYS as K } from "./keys";

const titleField = z
  .string()
  .transform((t) => t.trim())
  .pipe(z.string().max(LIMITS.thoughtTitleMax, { error: K.thoughtTitleTooLong }));

const textField = z
  .string({ error: K.required })
  .trim()
  .min(1, { error: K.required, abort: true })
  .max(LIMITS.thoughtTextMax, { error: K.thoughtTextTooLong });

/**
 * The New/Edit Thought form. Only `text` is required — Title is optional (never forced), and `bookId` links to
 * one of the caller's own books (ownership re-checked server-side in the repository, never trusted from the
 * client). Same "full replace" shape for both create and update — there is no separate edit mode.
 */
export const thoughtSchema = z
  .object({
    title: titleField,
    text: textField,
    bookId: z.string().trim().min(1).nullable(),
    favorite: z.boolean(),
  })
  .strict();

export type ThoughtInput = z.infer<typeof thoughtSchema>;

export interface ThoughtBookRef {
  id: string;
  title: string;
  author: string;
}

/** The client-visible shape of a saved thought — dates arrive as ISO strings. */
export interface ThoughtDTO {
  id: string;
  title: string | null;
  text: string;
  favorite: boolean;
  book: ThoughtBookRef | null;
  createdAt: string;
  updatedAt: string;
}
