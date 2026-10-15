import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "warm";

/** "primary" is the app's one standard CTA look everywhere; "warm" trades the dark ink fill for the scene's own
 *  walnut/ivory tones, for a spot (Books' own "+Add book") that now sits on light, warm chrome rather than a
 *  page's plain surface, where the usual dark pill reads as an unrelated, imported color. */
const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper shadow-[0_1px_0_rgb(255_255_255/0.12)_inset] hover:shadow-[0_10px_24px_-12px_var(--ink)]",
  warm: "bg-[color:color-mix(in_oklab,var(--scene-walnut)_68%,var(--scene-parchment)_32%)] text-[color:var(--scene-ivory)] shadow-[0_1px_0_rgb(255_255_255/0.2)_inset] hover:shadow-[0_10px_24px_-12px_var(--scene-walnut)]",
};

/**
 * A Button that navigates instead of submitting — same look, for a server component
 * CTA that has nothing to do first (compare `Button`, which needs client state for loading/success).
 */
export function ButtonLink({ variant = "primary", className = "", children, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link
      className={`group relative inline-flex h-[3.125rem] items-center justify-center gap-2 rounded-xl px-6 text-base font-medium transition duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.985] ${variants[variant]} ${className}`}
      {...props}
    >
      <span>{children}</span>
    </Link>
  );
}
