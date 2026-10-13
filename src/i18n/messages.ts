import en from "../../messages/en.json";
import hy from "../../messages/hy.json";
import type { Locale } from "./config";

/** Static imports keep the catalogs usable from route handlers as well as components. */
export const catalogs = { en, hy } as const satisfies Record<Locale, unknown>;
export type Messages = typeof en;
