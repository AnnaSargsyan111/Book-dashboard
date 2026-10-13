"use client";

import { CircleAlert, Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

/** Form-level message (server, network or rate-limit problems, or a neutral confirmation). */
export function FormAlert({ tone = "error", children, action }: { tone?: "error" | "info"; children?: ReactNode; action?: ReactNode }) {
  const Icon = tone === "error" ? CircleAlert : Info;
  return (
    <AnimatePresence initial={false}>
      {children ? (
        <motion.div
          key="alert"
          role={tone === "error" ? "alert" : "status"}
          initial={{ opacity: 0, height: 0, y: -6 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-[0.9375rem] leading-snug ${
              tone === "error" ? "border-danger/40 bg-danger-bg text-danger" : "border-rule-strong bg-surface text-ink-2"
            }`}
          >
            <Icon className="mt-[0.1em] size-[1.125rem] shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p>{children}</p>
              {action ? <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">{action}</div> : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
