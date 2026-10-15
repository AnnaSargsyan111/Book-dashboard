export const BOOK_INTRO_SEEN_KEY = "mystbook:intro-seen";
export const BOOK_INTRO_ACTIVE_ATTR = "data-book-intro";
export const BOOK_INTRO_DONE_EVENT = "mystbook:intro-done";

/** Re-arms the closed-book entrance so it plays again the next time the hub page loads (called on every login). */
export function rearmBookIntro(): void {
  try {
    localStorage.removeItem(BOOK_INTRO_SEEN_KEY);
  } catch {
    // Best-effort: if storage is blocked, the intro simply behaves as it already would.
  }
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
