let locks = 0;
let savedOverflow = "";

/**
 * Stops the page behind a modal / full-screen cover from scrolling, and returns the function that lifts the lock.
 *
 * Locks are counted: the first one remembers the page's own `overflow`, the last one to be lifted restores it,
 * whatever order they're lifted in. This matters because covers overlap (the hub's closed book is still fading
 * out when the welcome modal opens). With each one saving and restoring `overflow` on its own, the second saved
 * "hidden" as the value to go back to, and when the first let go and then the second closed, the page was left
 * locked — no scrolling anywhere until a full reload.
 */
export function lockBodyScroll(): () => void {
  if (locks === 0) savedOverflow = document.body.style.overflow;
  locks += 1;
  document.body.style.overflow = "hidden";

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) document.body.style.overflow = savedOverflow;
  };
}
