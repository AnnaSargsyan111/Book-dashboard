"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type MouseEvent, useState } from "react";
import { isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { useToast } from "@/ui/toast/ToastProvider";
import { mysteryApi } from "./api";

/**
 * The same quick-delete icon `DeleteBookButton` puts on a library card's corner (`variant="overlay"`), here for
 * one "Recently Recommended" card — removes the `MysteryRecommendationView` row, never the library book "+ Add"
 * may already have made from it (see `deleteRecommendationView`'s own doc comment) — and the dialog says so
 * when that book exists (`inLibrary`). Always confirms first. The
 * caller owns the list (`RecentlyRecommended` holds its own fetched state, not server-rendered), so success just
 * calls back up to drop this card rather than a router refresh.
 */
export function DeleteRecommendationButton({ viewId, title, inLibrary, onRemoved }: { viewId: string; title: string; inLibrary: boolean; onRemoved: () => void }) {
  const t = useTranslations("mysteryBook.recent.deleteDialog");
  const tc = useTranslations("common");
  const tk = useTranslateKey();
  const { show: showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await mysteryApi.removeRecommendation(viewId);
      setOpen(false);
      showToast(t("toast"));
      onRemoved();
    } catch (e) {
      if (isApiRequestError(e)) setError(tk(e.messageKey) ?? null);
      else throw e;
    } finally {
      setBusy(false);
    }
  }

  function openDialog(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        aria-label={t("iconLabel", { title })}
        onClick={openDialog}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-black/15 text-white/85 backdrop-blur-[2px] transition-colors hover:bg-black/45 hover:text-white"
      >
        <Trash2 className="size-[1rem]" aria-hidden="true" />
      </button>

      {open ? (
        <ConfirmDialog
          titleId={`delete-recommendation-${viewId}`}
          title={t("title")}
          body={t(inLibrary ? "bodyInLibrary" : "body", { title })}
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
