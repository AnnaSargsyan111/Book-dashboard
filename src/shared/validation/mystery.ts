import { z } from "zod";
import { LIMITS } from "./limits";
import { VALIDATION_KEYS as K } from "./keys";

/** Step 1 — mood taxonomy. Every catalog book carries a 0–1 score for each of these (its "mood profile",
 *  see server/mystery/catalog.ts) — moods are matched against that vector, never mapped 1:1 to a genre. */
export const MOOD_KEYS = ["magical", "cozy", "escapist", "emotional", "intense", "lightFun", "thoughtProvoking", "mysterious"] as const;
export type MoodKey = (typeof MOOD_KEYS)[number];

/** Step 2 — the Mystery Book catalog's own genre list. Deliberately separate from the 22-genre list a user's own
 *  library uses (src/shared/genres.ts): this one reflects what the curated catalog actually contains. */
export const MYSTERY_GENRE_KEYS = [
  "fantasy",
  "romance",
  "mysteryThriller",
  "scienceFiction",
  "literaryFiction",
  "historicalFiction",
  "horror",
  "adventure",
  "biography",
  "selfDevelopment",
  "youngAdult",
  "nonFiction",
] as const;
export type MysteryGenreKey = (typeof MYSTERY_GENRE_KEYS)[number];

/** Step 3 — optional, at most one. */
export const EXPERIENCE_KEYS = ["escapeMe", "makeMeFeel", "keepMeHooked", "makeMeThink", "makeMeSmile", "surpriseMe"] as const;
export type ExperienceKey = (typeof EXPERIENCE_KEYS)[number];

/** Step 4 — exactly one, mandatory. Chosen at the same point the entry screen describes ("Two Reveal Modes"). */
export const REVEAL_MODES = ["keep_mystery", "show_now"] as const;
export type RevealMode = (typeof REVEAL_MODES)[number];

/**
 * One Mystery Book session's answers, sent once all mandatory steps are done. `genres` is required by the
 * schema whenever the client includes it at all, but the field itself is optional — the cold-start check
 * (computed server-side when the page loads, see app/mystery-book/page.tsx) decides whether Step 2 is even
 * shown, and an omitted `genres` is exactly what "the step was skipped" looks like on the wire.
 */
export const mysteryRecommendSchema = z
  .object({
    moods: z.array(z.enum(MOOD_KEYS)).min(1, { error: K.moodRequired }).max(LIMITS.moodsMax, { error: K.tooManyMoods }),
    genres: z.array(z.enum(MYSTERY_GENRE_KEYS)).min(1, { error: K.mysteryGenreRequired }).max(LIMITS.mysteryGenresMax, { error: K.tooManyMysteryGenres }).optional(),
    experience: z.enum(EXPERIENCE_KEYS).optional(),
    revealMode: z.enum(REVEAL_MODES, { error: K.revealModeRequired }),
  })
  .strict();

export type MysteryRecommendInput = z.infer<typeof mysteryRecommendSchema>;

/** What Step 4 hands back. For `revealMode: "keep_mystery"`, `book` never carries an identifying field — the
 *  server withholds title/author/cover entirely rather than trusting the client not to render them. */
export interface MysteryRecommendResult {
  pickId: string;
  revealMode: RevealMode;
  book: MysteryBookView;
  reasoning: string;
}

/** The identifying fields are only ever present for `revealMode: "show_now"`. */
export interface MysteryBookView {
  genre: MysteryGenreKey;
  moodMatch: number;
  approxPages: number;
  title: string | null;
  author: string | null;
  coverUrl: string | null;
}

// Any script is accepted, same as a book's Title/Author — a delivery address is not Latin-restricted.
const addressLine = (max: number) =>
  z
    .string({ error: K.required })
    .trim()
    .min(1, { error: K.required, abort: true })
    .max(max, { error: K.addressFieldTooLong });
const addressLineOptional = (max: number) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().max(max, { error: K.addressFieldTooLong }));

/** Armenia only, deliberately: always "+374" followed by exactly 8 digits. The address form's own input only
 *  ever holds the 8 local digits (the "+374" is a fixed, non-editable prefix shown beside it), but the field's
 *  real value — here, in client state, and in the database — is always this full string. */
const phoneField = z.string({ error: K.required }).regex(/^\+374\d{8}$/, { error: K.phoneInvalid });

/** Required before an order can be placed (Section "Delivery Address"). Collected in its own step after the
 *  result screen's CTA, once a pick already exists — see `PATCH /api/v1/mystery/pick/:id/address`. */
export const mysteryAddressSchema = z
  .object({
    fullName: addressLine(LIMITS.addressNameMax),
    addressLine1: addressLine(LIMITS.addressLineMax),
    addressLine2: addressLineOptional(LIMITS.addressLineMax),
    city: addressLine(LIMITS.addressCityMax),
    region: addressLineOptional(LIMITS.addressCityMax),
    postalCode: addressLine(LIMITS.addressPostalMax),
    country: addressLine(LIMITS.addressCityMax),
    phone: phoneField,
  })
  .strict();

export type MysteryAddressInput = z.infer<typeof mysteryAddressSchema>;

/** The most recent address on file, if any — prefills the address step so a returning user is never asked to
 *  retype it (Cold-Start's own "don't ask for what we already know" applied to this step too). */
export type SavedAddress = MysteryAddressInput | null;

/** MVP pricing: one flat price for any Mystery Book pick, regardless of which title the engine lands on — the
 *  product being sold is the curated surprise, not a specific book. Placeholder AMD amounts, no real catalog
 *  pricing exists yet. Shared (not server-only) since the Payment step renders these directly. */
export const MYSTERY_BOOK_PRICE_AMD = 7900;
export const DELIVERY_FEE_AMD = 1500;

/** Payment step (MVP, Section "Payment"): online (card) payment only, plus a required non-returnable
 *  acknowledgment. No real gateway — nothing here collects card details, and no charge is ever made. */
export const PAYMENT_METHODS = ["card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const mysteryOrderSchema = z
  .object({
    paymentMethod: z.enum(PAYMENT_METHODS, { error: K.paymentMethodRequired }),
    acknowledgeNonReturnable: z.literal(true, { error: K.nonReturnableAckRequired }),
  })
  .strict();

export type MysteryOrderInput = z.infer<typeof mysteryOrderSchema>;

/** Post-Delivery Feedback (optional) — the learning-loop input. Reachable from the confirmation screen even
 *  though there's no real delivery to trigger it yet (see README "Known limits"). */
export const FEEDBACK_RATINGS = ["loved", "okay", "not_for_me"] as const;
export type FeedbackRating = (typeof FEEDBACK_RATINGS)[number];

export const FEEDBACK_TAG_KEYS = ["genre", "story", "writing", "characters", "mood", "author"] as const;
export type FeedbackTagKey = (typeof FEEDBACK_TAG_KEYS)[number];

export const mysteryFeedbackSchema = z
  .object({
    rating: z.enum(FEEDBACK_RATINGS, { error: K.feedbackRatingRequired }),
    tags: z.array(z.enum(FEEDBACK_TAG_KEYS)).max(LIMITS.feedbackTagsMax, { error: K.tooManyFeedbackTags }).optional(),
  })
  .strict();

export type MysteryFeedbackInput = z.infer<typeof mysteryFeedbackSchema>;

/**
 * "Show Me Now" only: browsing up to `LIMITS.mysteryRerollMax` distinct candidates before committing to one.
 * Deliberately does NOT persist a pick — a book the user sees here and moves past stays eligible for a future
 * session, unlike `mysteryRecommendSchema`'s immediate-persist behavior. `excludeSlugs` is this round's own
 * already-seen candidates (so the next preview doesn't repeat one), never the caller's permanent history — the
 * server adds that separately from its own records.
 */
export const mysteryPreviewSchema = z
  .object({
    moods: z.array(z.enum(MOOD_KEYS)).min(1, { error: K.moodRequired }).max(LIMITS.moodsMax, { error: K.tooManyMoods }),
    genres: z.array(z.enum(MYSTERY_GENRE_KEYS)).min(1, { error: K.mysteryGenreRequired }).max(LIMITS.mysteryGenresMax, { error: K.tooManyMysteryGenres }).optional(),
    experience: z.enum(EXPERIENCE_KEYS).optional(),
    excludeSlugs: z.array(z.string()).max(LIMITS.mysteryRerollMax).optional(),
  })
  .strict();

export type MysteryPreviewInput = z.infer<typeof mysteryPreviewSchema>;

/** One browsed-but-uncommitted candidate. `bookSlug` is only ever exposed here (never on `MysteryBookView`
 *  generally) — safe because this type is show_now-only, where the title/author/cover are already revealed. */
export interface MysteryPreviewResult {
  bookSlug: string;
  book: MysteryBookView;
  reasoning: string;
}

/** Finalizes one specific previewed candidate — the only point a "Show Me Now" pick is actually written to the
 *  database. The server re-validates `bookSlug` against the same eligibility filters rather than trusting it
 *  outright, but does not re-run ranking: it must persist exactly the book the user is looking at. */
export const mysteryCommitSchema = z
  .object({
    moods: z.array(z.enum(MOOD_KEYS)).min(1, { error: K.moodRequired }).max(LIMITS.moodsMax, { error: K.tooManyMoods }),
    genres: z.array(z.enum(MYSTERY_GENRE_KEYS)).min(1, { error: K.mysteryGenreRequired }).max(LIMITS.mysteryGenresMax, { error: K.tooManyMysteryGenres }).optional(),
    experience: z.enum(EXPERIENCE_KEYS).optional(),
    bookSlug: z.string({ error: K.required }).min(1, { error: K.required }),
  })
  .strict();

export type MysteryCommitInput = z.infer<typeof mysteryCommitSchema>;

/**
 * The Payment step's card fields (Section "Payment", MVP) — decorative only, never sent to the server or part of
 * any API contract (the actual order request always sends just `{paymentMethod: "card", acknowledgeNonReturnable}`,
 * see `mysteryOrderSchema`). Validated purely so typing into them behaves like a real checkout: digits-only,
 * fixed-length card number and CVV, Latin-only cardholder name, and an expiry that must be a real, unexpired
 * month.
 */
const cardExpiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;

export const mysteryCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, { error: K.cardNumberInvalid }),
  cardName: z
    .string()
    .trim()
    .min(1, { error: K.required, abort: true })
    .regex(/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/, { error: K.latinOnly }),
  cardExpiry: z
    .string()
    .regex(cardExpiryPattern, { error: K.cardExpiryInvalid })
    .refine(
      (v) => {
        if (!cardExpiryPattern.test(v)) return true; // format error already reported above
        const [mm, yy] = v.split("/").map(Number);
        const now = new Date();
        return new Date(2000 + yy!, mm!, 1) > new Date(now.getFullYear(), now.getMonth(), 1);
      },
      { error: K.cardExpired },
    ),
  cardCvv: z.string().regex(/^\d{3}$/, { error: K.cvvInvalid }),
});

export type MysteryCardInput = z.infer<typeof mysteryCardSchema>;

/**
 * One row for Mystery Book → "Recently Recommended". `revealMode: "keep_mystery"` picks are never included here
 * (never queried for this at all, not merely filtered in the UI) — the whole point of that mode is that the book
 * stays unidentified, and a history list with a cover and an "Add" button would spoil it the same way putting it
 * on the result screen would.
 */
export interface MysteryRecentRecommendation {
  viewId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  genre: MysteryGenreKey;
  reasoning: string;
  createdAt: string;
  /** Set once "+ Add" → Book Detail → Save has run for this recommendation — the card then shows "Added to My
   *  Books" / "View in My Books" instead of "+ Add", and the same recommendation can never be added a second time. */
  libraryBookId: string | null;
  /** The reader's own review, if they left one from this card (see `mysteryFeedbackSchema`). */
  feedbackRating: FeedbackRating | null;
  feedbackTags: FeedbackTagKey[];
}
