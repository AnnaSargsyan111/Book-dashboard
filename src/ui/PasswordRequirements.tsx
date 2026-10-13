"use client";

import { Check, Circle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { PASSWORD_RULES } from "@/shared/validation/password-rules";
import { VALIDATION_PARAMS } from "@/shared/validation/keys";

/**
 * Live checklist. It reads the SAME rule list the API enforces, so a tick here means the server will accept it.
 * Every state has an icon and a spoken status; colour is only reinforcement.
 *  - met:   ticked, text highlighted like a marked passage
 *  - error: the user tried to submit while this rule was unmet
 *  - idle:  not met yet (neutral, so nothing shouts while the person is still typing)
 */
export function PasswordRequirements({ password, showErrors, id }: { password: string; showErrors: boolean; id?: string }) {
  const t = useTranslations("passwordRules");
  const label = t as unknown as (key: string, values?: Record<string, number>) => string;
  const auto = useId();
  const titleId = `${auto}-title`;

  return (
    <div id={id} role="group" aria-labelledby={titleId}>
      <p id={titleId} className="sr-only">
        {t("title")}
      </p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          const state = ok ? "met" : showErrors ? "error" : "idle";
          return (
            <li key={rule.id} data-met={ok} className="flex items-center gap-2 text-[0.9375rem] leading-snug">
              <span
                aria-hidden="true"
                className={`grid size-5 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                  state === "met" ? "scale-100 bg-ok text-paper" : state === "error" ? "bg-danger text-paper" : "border border-rule-strong text-transparent"
                }`}
              >
                {state === "met" ? <Check className="size-3" strokeWidth={3.5} /> : state === "error" ? <X className="size-3" strokeWidth={3.5} /> : <Circle className="size-1" />}
              </span>
              <span className={state === "error" ? "text-danger" : state === "met" ? "text-ink" : "text-muted"}>
                <span className="marker-live">{label(rule.id, VALIDATION_PARAMS)}</span>
                <span className="sr-only">
                  {" "}
                  ({t(ok ? "met" : "unmet")})
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
