"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/** The desktop header's five section links. An underline marks the active one and sweeps in on hover. */
export function PrimaryNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav aria-label={t("label")} className={className}>
      <ul className="flex items-center gap-7 xl:gap-9">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-active={active || undefined}
                className={`nav-link relative py-1 text-[0.8125rem] font-medium uppercase tracking-[0.12em] transition-colors duration-200 ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
