"use client";

import { CircleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Inline validation message. It carries an icon AND text (never colour alone), announces itself to screen readers,
 * and eases open so the layout below it does not jump.
 */
export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          key={message}
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start gap-1.5 overflow-hidden pt-1.5 text-sm leading-snug text-danger"
        >
          <CircleAlert className="mt-[0.15em] size-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
