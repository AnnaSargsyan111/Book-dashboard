"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TextField, type TextFieldProps } from "./TextField";

/**
 * Password input with a show/hide control. Reusable on every auth form (register, login, reset).
 * The toggle keeps focus in the input on pointer press so typing is never interrupted, stays reachable by keyboard,
 * and announces its next action ("Show password" / "Hide password") in the active language.
 */
export function PasswordField(props: Omit<TextFieldProps, "type" | "trailing">) {
  const t = useTranslations("auth.password");
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      trailing={
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("hide") : t("show")}
          className="relative mr-1.5 grid size-10 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-rule/60 hover:text-ink"
        >
          <Eye className={`absolute size-5 transition duration-200 ${visible ? "scale-75 opacity-0" : "scale-100 opacity-100"}`} aria-hidden="true" />
          <EyeOff className={`absolute size-5 transition duration-200 ${visible ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} aria-hidden="true" />
        </button>
      }
    />
  );
}
