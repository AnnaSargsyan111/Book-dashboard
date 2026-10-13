import { useTranslations } from "next-intl";

/** A page with a margin rule and a highlighter stroke, next to the wordmark. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="22" height="26" rx="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M11.5 3.5v25" stroke="currentColor" strokeWidth="1.25" opacity="0.5" />
      <rect x="14.5" y="11" width="9" height="4.2" rx="1" fill="var(--marker)" />
      <path d="M14.5 20h9M14.5 23.5h5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  const t = useTranslations("meta");
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="font-display text-[1.4rem] font-medium italic leading-none tracking-tight">{t("appName")}</span>
    </span>
  );
}
