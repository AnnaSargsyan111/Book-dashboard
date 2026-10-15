"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useSyncExternalStore } from "react";
import { BOOK_INTRO_COOKIE } from "@/lib/book-intro";
import { BookIntroCover } from "./BookIntroCover";
import { richMarkDark } from "./rich";

const noop = () => () => {};

/** The first name held by the "intro pending" cookie, or null when no entrance is pending. Read in the browser at
 *  the moment of rendering — a `loading.tsx` fallback is prepared ahead of any particular request, so it can't ask
 *  the server whether this visit follows a login. */
function readPendingName(): string | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${BOOK_INTRO_COOKIE}=`));
  return match === undefined ? null : decodeURIComponent(match.slice(BOOK_INTRO_COOKIE.length + 1));
}

/**
 * What the hub shows while its page is being built. Straight after logging in, signing up or finishing onboarding
 * that is the closed book itself — the same picture the hub's own `BookIntro` continues from, so the reader goes
 * from the form to the book with nothing in between. At any other time it is the plain `fallback` skeleton.
 * `useSyncExternalStore` keeps a server-rendered fallback and its hydration in agreement (the server snapshot
 * is always "nothing pending"), then switches to the real answer.
 */
export function HubEntrance({ fallback }: { fallback: ReactNode }) {
  const t = useTranslations("home");
  const name = useSyncExternalStore(noop, readPendingName, () => null);

  if (name === null) return <>{fallback}</>;
  return (
    <div aria-hidden="true" className="book-intro-backdrop fixed inset-0 z-[100] flex items-center justify-center p-5">
      <BookIntroCover eyebrow={t("eyebrow", { name })} title={t.rich("title", richMarkDark)} intro={t("intro")} />
    </div>
  );
}
