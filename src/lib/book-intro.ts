export const BOOK_INTRO_SEEN_KEY = "mystbook:intro-seen";
export const BOOK_INTRO_ACTIVE_ATTR = "data-book-intro";
export const BOOK_INTRO_DONE_EVENT = "mystbook:intro-done";

/** Set by log in / sign up / finishing onboarding, holding the reader's first name (for the book's "Welcome back,
 *  <name>" line). A cookie rather than only a `localStorage` flag because the *server* has to see it: with it, the
 *  hub's `loading.tsx` and the hub page itself draw the closed book from the very first paint, instead of a blank
 *  or skeleton page for the moment before the client could decide. Cleared once the book opens; short-lived so a
 *  stale one can never replay the entrance much later. */
export const BOOK_INTRO_COOKIE = "mystbook_intro";

function setIntroCookie(value: string, maxAgeSeconds: number): void {
  document.cookie = `${BOOK_INTRO_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

/** Re-arms the closed-book entrance so it plays the next time the hub page loads (called on every login, sign-up
 *  and finished onboarding), and starts showing it on the way there. */
export function rearmBookIntro(firstName: string): void {
  try {
    localStorage.removeItem(BOOK_INTRO_SEEN_KEY);
  } catch {
    // Best-effort: if storage is blocked, the intro simply behaves as it already would.
  }
  setIntroCookie(firstName, 600);
}

/** The book has opened: nothing is pending any more. */
export function clearBookIntroCookie(): void {
  setIntroCookie("", 0);
}

/** Whether the closed-book entrance will play on this hub load: not under reduced motion, and not once it has
 *  already been seen since it was last re-armed. The one place this is decided, so the intro itself and the
 *  Welcome Modal (which waits its turn behind it) can never disagree. */
export function willBookIntroPlay(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return localStorage.getItem(BOOK_INTRO_SEEN_KEY) !== "true";
  } catch {
    return true;
  }
}

/** True while the closed-book cover is on screen — `ScrollReveal` holds its reveals until it's gone. */
export function isBookIntroActive(): boolean {
  return document.documentElement.hasAttribute(BOOK_INTRO_ACTIVE_ATTR);
}

export function setBookIntroActive(active: boolean): void {
  if (active) {
    document.documentElement.setAttribute(BOOK_INTRO_ACTIVE_ATTR, "true");
  } else {
    document.documentElement.removeAttribute(BOOK_INTRO_ACTIVE_ATTR);
    window.dispatchEvent(new Event(BOOK_INTRO_DONE_EVENT));
  }
}
