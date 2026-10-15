/** Every application path in one place. Adding a page = adding a line here. */
export const ROUTES = {
  home: "/",
  register: "/register",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  onboarding: "/onboarding",
  aboutMe: "/about-me",
  books: "/books",
  addBook: "/books/new",
  mysteryBook: "/mystery-book",
  thoughts: "/thoughts",
  newThought: "/thoughts/new",
  settings: "/settings",
} as const;

export const API = {
  register: "/api/v1/auth/register",
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  forgotPassword: "/api/v1/auth/forgot-password",
  resetPassword: "/api/v1/auth/reset-password",
  session: "/api/v1/auth/session",
  onboarding: "/api/v1/onboarding",
  welcomeSeen: "/api/v1/me/welcome-seen",
  profile: "/api/v1/profile",
  updateAccount: "/api/v1/me/account",
  changePassword: "/api/v1/auth/change-password",
  books: "/api/v1/books",
  bookAiFill: "/api/v1/books/ai-fill",
  mysteryRecommend: "/api/v1/mystery/recommend",
  mysteryPreview: "/api/v1/mystery/recommend/preview",
  mysteryCommit: "/api/v1/mystery/recommend/commit",
  mysteryRecent: "/api/v1/mystery/recent",
  thoughts: "/api/v1/thoughts",
} as const;

export const mysteryPickApi = {
  address: (pickId: string) => `/api/v1/mystery/pick/${pickId}/address`,
  order: (pickId: string) => `/api/v1/mystery/pick/${pickId}/order`,
  feedback: (pickId: string) => `/api/v1/mystery/pick/${pickId}/feedback`,
};

export const mysteryViewApi = {
  addToLibrary: (viewId: string) => `/api/v1/mystery/recommendation-view/${viewId}/add-to-library`,
  detail: (viewId: string) => `/api/v1/mystery/recommendation-view/${viewId}`,
  feedback: (viewId: string) => `/api/v1/mystery/recommendation-view/${viewId}/feedback`,
};

/** Where a book's own detail page lives (fields editable in place — no separate edit mode). */
export function bookDetailPath(id: string): string {
  return `/books/${id}`;
}

/** Mystery Book → Recently Recommended → "+ Add": the ordinary Add Book form, pre-filled from that shown
 *  recommendation's catalog title and linked back to it on save (Section 8 — opens Book Detail rather than
 *  saving immediately). */
export function addBookFromViewPath(viewId: string): string {
  return `${ROUTES.addBook}?view=${encodeURIComponent(viewId)}`;
}

export const bookApi = {
  detail: (id: string) => `/api/v1/books/${id}`,
  cover: (id: string) => `/api/v1/books/${id}/cover`,
  coverLookup: (id: string) => `/api/v1/books/${id}/cover-lookup`,
  reorder: (id: string) => `/api/v1/books/${id}/reorder`,
};

/** Where a thought's own page lives (fields editable in place — no separate edit mode, same as Book Detail). */
export function thoughtDetailPath(id: string): string {
  return `/thoughts/${id}`;
}

export const thoughtApi = {
  detail: (id: string) => `/api/v1/thoughts/${id}`,
};

/** Where a signed-in user belongs: mandatory onboarding first, then the app's own hub page ("/" — see
 *  `src/app/page.tsx`, which renders that hub directly rather than redirecting again). */
export function homePathFor(user: { onboardingCompleted: boolean }): string {
  return user.onboardingCompleted ? ROUTES.home : ROUTES.onboarding;
}

/** Only same-app relative paths may be used as a post-login target (no open redirects). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  const authPaths: string[] = [ROUTES.register, ROUTES.login, ROUTES.forgotPassword, ROUTES.resetPassword];
  if (authPaths.some((p) => next === p || next.startsWith(`${p}?`))) return null;
  return next;
}
