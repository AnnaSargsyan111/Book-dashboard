import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE, toLocale } from "./config";
import { catalogs } from "./messages";

/** Resolves the language for every server render from the persisted cookie; English when there is none. */
export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = toLocale(store.get(LOCALE_COOKIE)?.value);
  return { locale, messages: catalogs[locale] };
});
