import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Calm full-width confirmation (email sent, password updated, link problem) that replaces a form. */
export function StatusPanel({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div role="status" className="animate-rise rounded-2xl border border-rule-strong bg-surface p-6">
      <span className="mb-4 grid size-11 place-items-center rounded-full bg-marker text-[color:var(--marker-ink)]">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-2xl leading-tight">{title}</h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{children}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
