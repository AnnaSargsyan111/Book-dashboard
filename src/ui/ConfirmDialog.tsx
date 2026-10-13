"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonState } from "./Button";

/**
 * A small, focused confirmation modal for one irreversible action (deleting a book, a thought, a mystery
 * recommendation). Same backdrop/panel language as the app's other modals (ChangePasswordModal) —
 * `role="alertdialog"` rather than `"dialog"`, since this exists specifically to demand a decision.
 *
 * Portaled straight to `document.body` rather than rendering in place: this is triggered from all over the app,
 * and `position: fixed` only means "relative to the viewport" as long as no ancestor runs a CSS `animation` or
 * `transform` of its own (several of this app's `.animate-rise` entrances do) — any one of those turns itself
 * into the fixed positioning context instead, and the backdrop ends up pinned inside that element's own box
 * rather than covering the screen. A portal sidesteps the whole ancestor chain, so it can't happen again no
 * matter where this gets triggered from next.
 */
export function ConfirmDialog({
  titleId,
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  titleId: string;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state: ButtonState = busy ? "loading" : "idle";

  return createPortal(
    <div role="presentation" className="welcome-backdrop fixed inset-0 z-[80] flex items-center justify-center p-5" onClick={(e) => {
        // React events bubble through a portal to the component that opened it — e.g. up into a card's <Link>,
        // which would navigate to the very item just deleted.
        e.stopPropagation();
        if (e.target === e.currentTarget && !busy) onClose();
      }}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="welcome-panel relative w-full max-w-[26rem] rounded-[1.75rem] bg-surface p-7 shadow-[0_50px_100px_-30px_rgb(0_0_0/0.55)] outline-none sm:p-9"
      >
        <h2 id={titleId} className="max-w-[22ch] font-display text-[1.375rem] leading-tight">
          {title}
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{body}</p>
        {error ? <p className="mt-3 text-[0.9375rem] text-danger">{error}</p> : null}

        <div className="mt-7 flex items-center justify-end gap-3">
          <button type="button" onClick={() => !busy && onClose()} className="rounded-lg px-3 py-2.5 text-[0.9375rem] font-medium text-ink-2 transition-colors hover:text-ink">
            {cancelLabel}
          </button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} state={state}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
