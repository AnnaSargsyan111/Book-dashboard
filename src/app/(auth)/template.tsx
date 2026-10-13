import type { ReactNode } from "react";

/** A template remounts on every navigation, which gives the smooth page-to-page rise between auth screens. */
export default function AuthTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-rise">{children}</div>;
}
