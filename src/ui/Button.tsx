"use client";

import { ArrowRight, Check } from "lucide-react";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger";
export type ButtonState = "idle" | "loading" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  /** idle | loading (request in flight) | success (request done, navigating). Non-idle blocks further clicks. */
  state?: ButtonState;
  loadingLabel?: ReactNode;
  successLabel?: ReactNode;
  /** Adds the arrow that nudges forward on hover. */
  arrow?: boolean;
  /** Nothing to do right now (e.g. an unchanged form). Unlike the native `disabled`, focus is kept. */
  disabled?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper shadow-[0_1px_0_rgb(255_255_255/0.12)_inset] hover:-translate-y-px hover:shadow-[0_10px_24px_-12px_var(--ink)]",
  secondary: "border border-rule-strong bg-transparent text-ink hover:border-ink hover:bg-surface",
  danger: "bg-danger text-paper shadow-[0_1px_0_rgb(255_255_255/0.12)_inset] hover:-translate-y-px hover:shadow-[0_10px_24px_-12px_var(--danger)]",
};

/**
 * Buttons stay clickable-looking while busy or disabled (aria-disabled, never the native `disabled`) so keyboard
 * focus is never lost, and a click in either state is swallowed here. That is what prevents duplicate submissions,
 * and what lets a "nothing to save" button stay reachable while doing nothing.
 */
export function Button({ variant = "primary", block, state = "idle", loadingLabel, successLabel, arrow, disabled = false, className = "", children, onClick, type = "button", ...rest }: ButtonProps) {
  const busy = state !== "idle";
  const inert = busy || disabled;

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (inert) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  }

  return (
    <button
      type={type}
      aria-disabled={inert || undefined}
      aria-busy={state === "loading" || undefined}
      onClick={handleClick}
      className={`group relative inline-flex h-[3.125rem] items-center justify-center gap-2 rounded-xl px-6 text-base font-medium transition duration-200 ease-out active:translate-y-0 active:scale-[0.985] ${
        block ? "w-full" : ""
      } ${variants[variant]} ${state === "success" ? "!bg-ok !text-paper" : ""} ${
        busy ? "aria-disabled:cursor-progress" : disabled ? "pointer-events-none cursor-not-allowed opacity-45" : ""
      } ${className}`}
      {...rest}
    >
      <span key={state} className="animate-fade inline-flex items-center gap-2.5">
        {state === "loading" ? (
          <>
            <Spinner />
            <span>{loadingLabel ?? children}</span>
          </>
        ) : state === "success" ? (
          <>
            <Check className="size-[1.125rem]" strokeWidth={2.5} aria-hidden="true" />
            <span>{successLabel ?? children}</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            {arrow ? <ArrowRight className="size-[1.125rem] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" /> : null}
          </>
        )}
      </span>
    </button>
  );
}
