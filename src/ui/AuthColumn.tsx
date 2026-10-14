"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

/** The notebook ruling's line spacing (px): two grid steps, one field height. Keep in step with `--step` on
 *  `.ruled` in globals.css. */
const RULING_PITCH = 48;

/**
 * The form column of the auth screens: header (language switcher) and the centred form area.
 *
 * On desktop the page is a ruled sheet and the form sits on that ruling: every label, field, button and line of
 * text is a whole number of ruling steps tall (see `.auth-grid` in globals.css), and the ruling itself is shifted
 * so a line falls exactly on the top of the first element — wherever the vertical centring happens to put it.
 * Because everything is sized in ruling steps, no screen needs its own tightening rules to avoid scrolling.
 */
export function AuthColumn({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;

    // Layout position (offsetTop chain), not getBoundingClientRect: the page's entrance animation moves the content
    // with a transform, which must not leak into where the ruling thinks the form starts.
    const align = () => {
      // Anchored on the first field, because that is what has to land between two lines (the headings above it
      // vary in height); the rest of the form is built in whole steps from there.
      const anchor = content.querySelector<HTMLElement>(".control") ?? content;
      let top = 0;
      for (let el: HTMLElement | null = anchor; el && el !== root; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
      root.style.setProperty("--ruled-offset", `${((top % RULING_PITCH) + RULING_PITCH) % RULING_PITCH}px`);
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(content);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="auth-grid relative flex min-h-dvh flex-col">
      <div className="ruled pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true" />
      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8 lg:absolute lg:right-0 lg:top-0 lg:px-10 lg:py-5">
        <Logo className="lg:hidden" />
        <LanguageSwitcher />
      </header>

      <main id="main" data-lang-content className="relative flex flex-1 justify-center px-5 pb-14 pt-4 sm:px-8 lg:items-center lg:py-6">
        <div ref={contentRef} className={`w-full ${wide ? "max-w-[32rem]" : "max-w-[27rem]"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
