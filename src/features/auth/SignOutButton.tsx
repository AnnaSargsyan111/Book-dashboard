"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/shared/routes";
import { Button } from "@/ui/Button";
import { authApi } from "./api";

/**
 * `quiet` renders a plain text control (for screens where signing out is a side exit, not the main action).
 * `menuItem` renders a full-width row for use inside a dropdown (the account menu's one and only action);
 * `onAfterClick` fires the moment the click registers, so a caller (the account menu) can close itself immediately
 * instead of waiting on the network round trip.
 */
export function SignOutButton({ quiet = false, menuItem = false, onAfterClick }: { quiet?: boolean; menuItem?: boolean; onAfterClick?: () => void }) {
  const t = useTranslations("common");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    onAfterClick?.();
    if (busy) return;
    setBusy(true);
    try {
      await authApi.logout();
    } finally {
      // Even if the request failed, the server-side check on the next page decides; go to sign-in.
      router.replace(ROUTES.login);
      router.refresh();
    }
  }

  if (menuItem) {
    return (
      <button
        type="button"
        role="menuitem"
        onClick={signOut}
        aria-disabled={busy || undefined}
        className="w-full rounded-lg px-3.5 py-2.5 text-left text-[0.9375rem] text-ink transition-colors hover:bg-paper aria-disabled:opacity-60"
      >
        {t("signOut")}
      </button>
    );
  }

  if (quiet) {
    return (
      <button
        type="button"
        onClick={signOut}
        aria-disabled={busy || undefined}
        className="rounded-md px-1 text-[0.9375rem] font-medium text-muted underline decoration-rule-strong decoration-[1.5px] underline-offset-[5px] transition-colors hover:text-ink hover:decoration-ink"
      >
        {t("signOut")}
      </button>
    );
  }

  return (
    <Button variant="secondary" state={busy ? "loading" : "idle"} loadingLabel={t("signOut")} onClick={signOut}>
      {t("signOut")}
    </Button>
  );
}
