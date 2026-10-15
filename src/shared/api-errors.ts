/**
 * API error codes and the translation key each one maps to. Shared so the server (localizing `message`) and the
 * browser (localizing from the code, in whatever language is active NOW) can never disagree.
 */
export const API_ERROR_KEYS = {
  VALIDATION_ERROR: "errors.invalidRequest",
  UNSUPPORTED_MEDIA_TYPE: "errors.invalidRequest",
  UNAUTHENTICATED: "errors.unauthenticated",
  CSRF_ORIGIN_MISMATCH: "errors.forbidden",
  FORBIDDEN: "errors.forbidden",
  NOT_FOUND: "errors.notFound",
  RATE_LIMITED: "errors.rateLimited",
  INTERNAL_ERROR: "errors.server",
  INVALID_CREDENTIALS: "auth.invalidCredentials",
  EMAIL_TAKEN: "auth.emailTaken",
  TOKEN_INVALID_OR_EXPIRED: "auth.tokenInvalid",
  ONBOARDING_ALREADY_COMPLETED: "onboarding.alreadyCompleted",
  /** The "Fill with AI" lookup reached Google Books but found no record of the title/author. */
  AI_NO_MATCH: "books.add.aiNoMatch",
  /** A cover upload was rejected: not one of the accepted image types. */
  COVER_INVALID_TYPE: "books.detail.cover.invalidType",
  /** A cover upload was rejected: over the size cap. */
  COVER_TOO_LARGE: "books.detail.cover.tooLarge",
  /** The "Find cover" lookup reached Google Books but no result had a usable cover image. */
  COVER_NOT_FOUND: "books.detail.cover.noMatch",
  /** The Mystery Book engine has no eligible catalog title left for this user (an unlikely edge case — the
   *  catalog is small and every filter falls back rather than emptying the pool, but it is finite). */
  NO_MYSTERY_AVAILABLE: "mysteryBook.noneAvailable",
  /** A pick's book went from available to unavailable between the recommendation and placing the order — the
   *  UI intercepts this code specifically to show the Out-of-Stock screen rather than a generic error. */
  BOOK_OUT_OF_STOCK: "mysteryBook.outOfStock.subheading",
  /** A Recently Recommended book was already reviewed; a review is left once and then locked. */
  ALREADY_REVIEWED: "mysteryBook.recent.alreadyReviewed",
  /** Client-only: the request never reached the server. */
  NETWORK: "errors.network",
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_KEYS;

export function messageKeyFor(code: string): string {
  return API_ERROR_KEYS[code as ApiErrorCode] ?? "errors.server";
}

/** Public, non-sensitive user shape returned by the API. */
export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  onboardingCompleted: boolean;
  welcomeModalSeen: boolean;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, { key: string; message: string }>;
    retryAfterSeconds?: number;
  };
}
