import Link from "next/link";
import type { ComponentProps } from "react";

/** Inline link with an underline that darkens on hover. */
export function TextLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`font-medium text-ink underline decoration-rule-strong decoration-[1.5px] underline-offset-[5px] transition-colors hover:decoration-ink ${className}`}
      {...props}
    />
  );
}
