import { getEnv } from "@/server/config/env";
import { ApiError } from "@/server/http/errors";

function allowedOrigins(): Set<string> {
  const env = getEnv();
  const set = new Set<string>();
  for (const candidate of [env.APP_URL, ...(env.TRUSTED_ORIGINS ?? "").split(",")]) {
    try {
      if (candidate.trim()) set.add(new URL(candidate.trim()).origin);
    } catch {
      /* ignore malformed entries */
    }
  }
  return set;
}

/**
 * CSRF defence for cookie-authenticated, state-changing requests (on top of SameSite=Lax cookies and the
 * JSON-only Content-Type rule):
 *  - `Origin` present: it must be the app's own origin (APP_URL, TRUSTED_ORIGINS, or the request's own Host).
 *  - `Origin` absent: allowed unless the browser reports a cross-site request (`Sec-Fetch-Site`).
 */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  if (origin) {
    let sameHost = false;
    try {
      sameHost = new URL(origin).host === req.headers.get("host");
    } catch {
      /* malformed Origin is rejected below */
    }
    if (!sameHost && !allowedOrigins().has(origin)) throw new ApiError("CSRF_ORIGIN_MISMATCH", 403);
    return;
  }
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") throw new ApiError("CSRF_ORIGIN_MISMATCH", 403);
}

/** First X-Forwarded-For hop (set by the hosting platform), else X-Real-IP. Spoofable behind other proxies. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip")?.trim() || "unknown";
}
