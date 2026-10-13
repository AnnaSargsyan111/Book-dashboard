"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { Button } from "@/ui/Button";
import { ChangePasswordModal } from "./ChangePasswordModal";

/**
 * Change Password (opens the modal) and Sign Out, each with a short line of what it actually does. Bare content,
 * no card chrome — this sits directly on the open book's right-hand page (`settings/page.tsx`), which is already
 * the one "surface" the section needs.
 */
export function SecuritySection() {
  const t = useTranslations("settings.security");
  const [open, setOpen] = useState(false);

  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{t("eyebrow")}</p>
      <h2 className="mt-1 font-display text-xl">{t("title")}</h2>

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <p className="text-[0.9375rem] leading-relaxed text-muted">{t("passwordBody")}</p>
          <Button variant="secondary" onClick={() => setOpen(true)} className="mt-4">
            {t("changePassword")}
          </Button>
        </div>

        <hr className="border-rule" />

        <div>
          <p className="text-[0.9375rem] leading-relaxed text-muted">{t("signOutBody")}</p>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </div>
      </div>

      {open && <ChangePasswordModal onClose={() => setOpen(false)} />}
    </section>
  );
}
