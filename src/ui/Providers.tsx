"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { ToastProvider } from "./toast/ToastProvider";

/**
 * A page restored from the browser's back/forward cache is never re-rendered by the server, so a signed-out visitor
 * hitting Back could otherwise glimpse a stale, still-painted authenticated page before anything reacts. Forcing a
 * reload on a bfcache restore sends them straight back through the real (server-side) auth check instead.
 */
function BfcacheGuard() {
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) window.location.reload();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
  return null;
}

/** App-wide client providers. Motion honours the visitor's "reduce motion" setting everywhere. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <BfcacheGuard />
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}
