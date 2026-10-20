"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DATA_CHANGED_EVENT } from "@/lib/api/client";

/**
 * Keeps instant navigation honest. The sidebar links prefetch whole pages in the background (so a click shows the
 * page at once, with no skeleton), and Next.js remembers those copies for a few minutes. When the reader saves or
 * deletes anything, those copies are out of date — so every successful write (see `apiRequest`) announces itself
 * and this drops the stored copies and re-renders the current page. Client-side state (a half-typed form, an open
 * menu) is untouched by a refresh. Renders nothing.
 */
export function DataRefresher() {
  const router = useRouter();

  useEffect(() => {
    let pending = false;
    // Refresh at once, in a microtask: it is queued BEFORE the form's own redirect (which runs after the request's
    // promise resolves), so the page it lands on is fetched fresh rather than taken from the stored copy. Writes in
    // the same tick share one refresh.
    const onChange = () => {
      if (pending) return;
      pending = true;
      queueMicrotask(() => {
        pending = false;
        router.refresh();
      });
    };
    window.addEventListener(DATA_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, onChange);
  }, [router]);

  return null;
}
