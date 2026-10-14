import type { ReactNode } from "react";

/** Page heading pair used by every auth screen. */
export function Heading({ title, subtitle, className = "" }: { title: ReactNode; subtitle?: ReactNode; className?: string }) {
  return (
    <div className={`auth-heading mb-8 lg:mb-9 ${className}`}>
      <h1 tabIndex={-1} className="text-balance text-[clamp(2rem,1.55rem+1.7vw,2.75rem)] leading-[1.08] tracking-[-0.02em] outline-none">
        {title}
      </h1>
      {subtitle ? <p className="heading-subtitle mt-3 max-w-[34ch] text-[1.0625rem] leading-relaxed text-muted">{subtitle}</p> : null}
    </div>
  );
}
