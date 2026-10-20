"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/shared/routes";
import { Logo } from "../Logo";
import { NAV_ITEMS } from "./nav-items";

/** Which of the five sections a pathname belongs to (prefix match, same rule the nav links themselves use for
 *  "active" — so `/books/new` or `/books/abc123` still reads as Books). Falls back to Books, the app's own
 *  landing page, for any signed-in route outside the five (there are none today). `key` doubles as the lookup
 *  into `nav.quotes` below, so the photo and the quote always change together. */
const GROUNDS: { href: string; key: "aboutMe" | "books" | "mysteryBook" | "thoughts" | "settings"; src: string; position: string }[] = [
  { href: ROUTES.aboutMe, key: "aboutMe", src: "/images/about-me-hero.jpg", position: "78% 38%" },
  { href: ROUTES.books, key: "books", src: "/images/books-hero.jpg", position: "32% 48%" },
  { href: ROUTES.mysteryBook, key: "mysteryBook", src: "/images/mystery-hero.jpg", position: "58% 62%" },
  { href: ROUTES.thoughts, key: "thoughts", src: "/images/thoughts-hero.jpg", position: "68% 30%" },
  { href: ROUTES.settings, key: "settings", src: "/images/settings-hero.jpg", position: "18% 46%" },
];

function groundFor(pathname: string) {
  return GROUNDS.find((g) => pathname === g.href || pathname.startsWith(`${g.href}/`)) ?? GROUNDS[1]!;
}

const TYPE_MS = 26;
const HOLD_MS = 10_000;

/** Types `text` out one character at a time, holds the finished line for `HOLD_MS`, then clears and types it
 *  again — a loop, for as long as the component showing it stays mounted. Skipped under reduced motion, where
 *  the full line just shows immediately and stays put. */
function useTypewriter(text: string, reduced: boolean): string {
  const [length, setLength] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) {
      setLength(text.length);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function typeFrom(i: number) {
      if (cancelled) return;
      setLength(i);
      if (i < text.length) {
        timer = setTimeout(() => typeFrom(i + 1), TYPE_MS);
      } else {
        timer = setTimeout(() => {
          if (!cancelled) typeFrom(0);
        }, HOLD_MS);
      }
    }
    typeFrom(0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, reduced]);

  return text.slice(0, length);
}

/**
 * The app's spine on desktop: warm ivory paper, the same material the open-book pages and scene washes already
 * use, not the old dark "cloth" fill — see `globals.css`'s own note on why. Each section still carries its own
 * real photograph (a different room, a different photo, every time) and its own real, attributed quote about
 * reading and writing (from `nav.quotes`) — both exactly as real as before.
 *
 * The quote sits directly on the sidebar's own paper now, not inside a card — no background, no border — and
 * writes itself out letter by letter (`useTypewriter`), holds for ten seconds once finished, then clears and
 * writes again, for as long as that section's quote is on screen. The author line only appears once the quote
 * has finished typing, the way a signature follows a note rather than appearing with it.
 *
 * `min-h-dvh self-stretch` (not a fixed `h-dvh`) matters once a page's content runs taller than one viewport
 * (About Me with its profile sections, Mystery Book with recommendations loaded, etc.): a fixed-height sticky
 * sidebar would run out of room to stay pinned and visibly scroll away before the page's own bottom, baring the
 * plain page background beneath it. Stretching to match the content column's real height (the flex row's default
 * cross-axis behavior) keeps the sidebar covering the full page for every scroll position, with the `min-h-dvh`
 * floor still guaranteeing a full-viewport sidebar on short pages.
 *
 * The quote starts right under the nav. It is `sticky` with its `top` set to that very spot (34.2rem from the top
 * of the window, or 8rem above the bottom on a short window): at the top of the page it does not move at all, and as
 * the visitor scrolls it stays at that same height in the window — so it travels down the left column with them
 * rather than scrolling away upward with the nav and ending up stranded high on the page.
 */
export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const reduced = useReducedMotion();
  const ground = groundFor(pathname);

  const quotes = {
    aboutMe: { text: t("quotes.aboutMe.text"), author: t("quotes.aboutMe.author") },
    books: { text: t("quotes.books.text"), author: t("quotes.books.author") },
    mysteryBook: { text: t("quotes.mysteryBook.text"), author: t("quotes.mysteryBook.author") },
    thoughts: { text: t("quotes.thoughts.text"), author: t("quotes.thoughts.author") },
    settings: { text: t("quotes.settings.text"), author: t("quotes.settings.author") },
  } as const;
  const quote = quotes[ground.key];
  const typed = useTypewriter(quote.text, !!reduced);
  const done = typed.length === quote.text.length;

  return (
    <aside className="sidebar sticky top-0 hidden min-h-dvh self-stretch lg:flex" aria-label={t("label")}>
      <div className="flex w-full flex-col px-5 py-7">
        <Link href={ROUTES.home} className="shrink-0">
          <Logo className="px-2 text-ink" />
        </Link>

        <div key={ground.src} className="sidebar-photo-frame relative mt-6 aspect-[4/3] w-full shrink-0">
          <Image src={ground.src} alt="" fill sizes="224px" priority className="object-cover" style={{ objectPosition: ground.position }} />
        </div>

        <nav className="mt-7 shrink-0" aria-label={t("label")}>
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} data-active={active || undefined} className="sidebar-link">
                    <span className="sidebar-link-icon">
                      <Icon className="size-[1.0625rem]" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-[0.9375rem] font-medium">{t(item.key)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-note sticky top-[min(34.2rem,calc(100dvh-8rem))] mt-7 max-w-[13.5rem] self-start">
          <p className="sidebar-quote relative font-display text-[0.875rem] italic leading-relaxed text-ink-2">
            <span className="sr-only">{quote.text}</span>
            <span aria-hidden="true">
              {typed}
              {done ? "”" : null}
            </span>
            {!done ? <span className="sidebar-caret" aria-hidden="true" /> : null}
          </p>
          <p className={`mt-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted transition-opacity duration-500 ${done ? "opacity-100" : "opacity-0"}`}>
            {quote.author}
          </p>
        </div>
      </div>
    </aside>
  );
}
