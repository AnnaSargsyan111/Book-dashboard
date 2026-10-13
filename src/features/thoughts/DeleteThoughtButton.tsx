"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type MouseEvent, useState } from "react";
import { isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { useToast } from "@/ui/toast/ToastProvider";
import { thoughtsApi } from "./api";

/**
 * Always confirms first — deleting a thought is not undoable. Deliberately understated (a quiet icon, never a
 * prominent control) — see the Thoughts page spec's "keep secondary actions visually subtle." `redirectTo` sends
 * the browser somewhere else after a successful delete (the editor leaves the page it's about to no longer
 * have); omitted, the caller's own list just refreshes in place.
 */
export function DeleteThoughtButton({ id, redirectTo, variant = "icon" }: { id: string; redirectTo?: string; variant?: "icon" | "button" }) {
  const t = useTranslations("thoughts.deleteDialog");
  const tc = useTranslations("common");
  const tk = useTranslateKey();
  const router = useRouter();
  const { show: showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await thoughtsApi.remove(id);
      setOpen(false);
      showToast(t("toast"));
      if (redirectTo) router.replace(redirectTo);
      else router.refresh();
    } catch (e) {
      if (isApiRequestError(e)) setError(tk(e.messageKey) ?? null);
      else throw e;
    } finally {
      setBusy(false);
    }
  }

  function openDialog(e: MouseEvent) {
    // The card icon sits over a <Link>: without this, the click would also navigate.
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      {variant === "button" ? (
        <button type="button" onClick={openDialog} className="text-[0.9375rem] font-medium text-danger underline-offset-4 hover:underline">
          {t("buttonLabel")}
        </button>
      ) : (
        <button
          type="button"
          aria-label={t("iconLabel")}
          onClick={openDialog}
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-danger"
        >
          <Trash2 className="size-[1rem]" aria-hidden="true" />
        </button>
      )}

      {open ? (
        <ConfirmDialog
          titleId={`delete-thought-${id}`}
          title={t("title")}
          body={t("body")}
          confirmLabel={t("confirm")}
          cancelLabel={tc("cancel")}
          danger
          busy={busy}
          error={error}
          onConfirm={confirmDelete}
          onClose={() => !busy && setOpen(false)}
        />
      ) : null}
    </>
  );
}
