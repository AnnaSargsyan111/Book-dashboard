import { isProduction } from "@/server/config/env";

/** `__Host-` pins the cookie to this exact host over HTTPS with no Domain attribute (production only). */
export const sessionCookieName = () => (isProduction() ? "__Host-mystbook_session" : "mystbook_session");

const base = (value: string) =>
  [`${sessionCookieName()}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax", ...(isProduction() ? ["Secure"] : [])];

/** Serialized Set-Cookie header value that starts (or renews) a session. */
export function sessionCookie(token: string, expiresAt: Date): string {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  return [...base(token), `Expires=${expiresAt.toUTCString()}`, `Max-Age=${maxAge}`].join("; ");
}

/** Set-Cookie header value that removes the session cookie. */
export function clearedSessionCookie(): string {
  return [...base(""), "Expires=Thu, 01 Jan 1970 00:00:00 GMT", "Max-Age=0"].join("; ");
}
