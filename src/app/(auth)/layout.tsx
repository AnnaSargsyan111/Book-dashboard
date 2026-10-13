import type { ReactNode } from "react";
import { AuthShell } from "@/ui/AuthShell";

/** Persistent frame for register, login, forgot and reset: only the form column changes between them. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
