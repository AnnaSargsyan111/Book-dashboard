"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type MouseEvent, useState } from "react";
import { isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { useToast } from "@/ui/toast/ToastProvider";
import { booksApi } from "./api";

/**
 * The quick-delete icon: a card's corner (stops the click from also following the card's own link) and Book
 * Detail's own "Delete Book" button both use this. Always confirms first — deleting a book is not undoable.
 * `redirectTo` sends the browser somewhere else after a successful delete (Book Detail leaves the page it's
 * about to no longer have); omitted, the caller's own list just refreshes in place.
 */
export function DeleteBookButton({
  id,
  title,
  redirectTo,
  variant = "icon",
}: {
  id: string;
  title: string;
  redirectTo?: string;
  /** "icon" (plain, for a toolbar-like spot), "overlay" (a soft floating circle over a cover image — its own
   *  backdrop so it reads regardless of what's under it), or "button" (a plain text action, Book Detail's own). */
  variant?: "icon" | "overlay" | "button";
}) {
  const t = useTranslations("books.deleteDialog");
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
      await booksApi.remove(id);
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
    // The card icon sits inside a <Link>: without this, the click would also navigate.
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
          aria-label={t("iconLabel", { title })}
          onClick={openDialog}
          className={
            variant === "overlay"
              ? "grid size-8 shrink-0 place-items-center rounded-full bg-black/15 text-white/85 backdrop-blur-[2px] transition-colors hover:bg-black/45 hover:text-white"
              : "grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-danger"
          }
        >
          <Trash2 className="size-[1rem]" aria-hidden="true" />
        </button>
      )}

      {open ? (
        <ConfirmDialog
          titleId={`delete-book-${id}`}
          title={t("title")}
          body={t("body", { title })}
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
