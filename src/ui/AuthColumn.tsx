"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ROUTES } from "@/shared/routes";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

/**
 * The form column of the auth screens: header (language switcher) and the centred form area.
 *
 * Sign Up and "Tell us about yourself" are the longest forms, so on desktop their header and bottom padding are
 * trimmed (see the `register-*` / `onboarding-*` rules in globals.css) and the whole form, button included, fits the
 * first screen. Nothing else about the layout, sizes or type changes, and every other screen keeps its original
 * spacing.
 */
export function AuthColumn({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const path = usePathname();
  const dense = path === ROUTES.register ? "register" : path === ROUTES.onboarding ? "onboarding" : "";

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="ruled pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true" />
      <header className={`relative flex items-center justify-between px-5 py-5 sm:px-8 lg:justify-end lg:px-12 lg:py-7 ${dense ? `${dense}-header` : ""}`}>
        <Logo className="lg:hidden" />
        <LanguageSwitcher />
      </header>

      <main
        id="main"
        data-lang-content
        className={`relative flex flex-1 justify-center px-5 pb-14 pt-4 sm:px-8 lg:items-center lg:pb-20 lg:pt-0 ${dense ? `${dense}-main` : ""}`}
      >
        <div className={`w-full ${wide ? "max-w-[32rem]" : "max-w-[27rem]"}`}>{children}</div>
      </main>
    </div>
  );
}
