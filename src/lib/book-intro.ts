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
