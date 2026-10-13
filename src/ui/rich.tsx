import type { ReactNode } from "react";

/** Rich-text tags for catalog strings such as "Start your <mark>notebook</mark>". */
export const richMark = {
  mark: (chunks: ReactNode) => <mark className="marker marker-sweep">{chunks}</mark>,
};

/** Same, for a `<mark>` sitting on a dark surface (`.cloth`) rather than light paper — see `.marker-dark`. */
export const richMarkDark = {
  mark: (chunks: ReactNode) => <mark className="marker-dark">{chunks}</mark>,
};
