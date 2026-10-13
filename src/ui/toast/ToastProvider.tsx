"use client";

import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const DISMISS_AFTER_MS = 3000;

interface ToastItem {
  id: number;
  message: ReactNode;
}

interface ToastContextValue {
  /** Shows a toast (top-right, ~3s, dismissible). Reusable wherever a brief confirmation is needed — not just About Me. */
  show: (message: ReactNode) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Mounted once, app-wide, in `Providers.tsx`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message: ReactNode) => {
      const id = ++nextId.current;
      setItems((list) => [...list, { id, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DISMISS_AFTER_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastViewport({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  const t = useTranslations("common");

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[200] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-full sm:max-w-sm sm:items-end">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            role="status"
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="toast-item pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-rule-strong bg-surface px-4 py-3.5 pr-3 shadow-[0_20px_45px_-20px_rgb(0_0_0/0.45)] sm:w-auto sm:min-w-[18rem]"
          >
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ok/15 text-ok">
              <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
            </span>
            <p className="flex-1 pt-0.5 text-[0.9375rem] leading-snug text-ink">{item.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              aria-label={t("close")}
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
