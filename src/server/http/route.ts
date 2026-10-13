import type { NextRequest } from "next/server";
import type { z, ZodType } from "zod";
import type { Locale } from "@/i18n/config";
import { messageKeyFor, type ApiErrorBody, type PublicUser } from "@/shared/api-errors";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { MAX_BODY_BYTES } from "@/server/config/policy";
import { getTranslator, localeFromCookieHeader } from "@/server/i18n/translator";
import { errorMessage, log } from "@/server/log";
import { sessionCookie, sessionCookieName } from "@/server/modules/auth/cookie";
import { resolveSession } from "@/server/modules/auth/session.service";
import { assertSameOrigin, clientIp } from "@/server/security/origin";
import { ApiError } from "./errors";

/**
 * The single place that applies, to every API route: origin/CSRF check, session lookup (with sliding-expiry cookie
 * renewal), JSON body handling, localization, no-store caching and the error envelope. Route files stay thin.
 *
 * Error envelope: { error: { code, message, fields?, retryAfterSeconds? } }, `message` in the request's language.
 */
export interface HandlerCtx {
  req: NextRequest;
  ip: string;
  locale: Locale;
  t: ReturnType<typeof getTranslator>;
  user: PublicUser | null;
  sessionToken: string | null;
  /** Parses the JSON body (Content-Type must be application/json, at most 100 KB). */
  body: () => Promise<unknown>;
  /** Dynamic segments (e.g. `[id]`). Empty object for a route with none. */
  params: Record<string, string>;
}

export interface HandlerResult {
  status?: number;
  body?: unknown;
  setCookies?: string[];
}

const STATE_CHANGING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

/** Validates untrusted input with a shared schema; failures become a localized 400 with per-field keys. */
export function parseInput<S extends ZodType>(schema: S, raw: unknown): z.infer<S> {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  const fields = fieldErrorKeys(result.error);
  throw new ApiError("VALIDATION_ERROR", 400, { fields: Object.keys(fields).length ? fields : undefined });
}

function errorResponse(error: ApiError, t: HandlerCtx["t"]): Response {
  const body: ApiErrorBody = { error: { code: error.code, message: t(messageKeyFor(error.code)) } };
  if (error.fields) {
    body.error.fields = Object.fromEntries(Object.entries(error.fields).map(([field, key]) => [field, { key, message: t(key) }]));
  }
  const headers = new Headers(JSON_HEADERS);
  if (error.retryAfterSeconds !== undefined) {
    body.error.retryAfterSeconds = error.retryAfterSeconds;
    headers.set("retry-after", String(error.retryAfterSeconds));
  }
  return new Response(JSON.stringify(body), { status: error.status, headers });
}

export function route(
  options: { auth?: boolean; csrf?: boolean },
  handler: (ctx: HandlerCtx) => Promise<HandlerResult>,
): (req: NextRequest, routeCtx?: { params: Promise<Record<string, string>> }) => Promise<Response> {
  const requireAuth = options.auth ?? false;
  const checkOrigin = options.csrf ?? true;

  return async (req, routeCtx) => {
    const locale = localeFromCookieHeader(req.headers.get("cookie"));
    const t = getTranslator(locale);
    try {
      if (checkOrigin && STATE_CHANGING.has(req.method)) assertSameOrigin(req);

      const sessionToken = req.cookies.get(sessionCookieName())?.value ?? null;
      const resolved = sessionToken ? await resolveSession(sessionToken, { slide: true }) : null;
      if (requireAuth && !resolved) throw new ApiError("UNAUTHENTICATED", 401);

      const body = async () => {
        if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
          throw new ApiError("UNSUPPORTED_MEDIA_TYPE", 415);
        }
        const text = await req.text();
        if (text.length > MAX_BODY_BYTES) throw new ApiError("VALIDATION_ERROR", 413);
        try {
          return text.length ? JSON.parse(text) : {};
        } catch {
          throw new ApiError("VALIDATION_ERROR", 400);
        }
      };

      const params = routeCtx ? await routeCtx.params : {};
      const result = await handler({ req, ip: clientIp(req.headers), locale, t, user: resolved?.user ?? null, sessionToken, body, params });

      const headers = new Headers(JSON_HEADERS);
      const cookies = [...(result.setCookies ?? [])];
      if (resolved?.renewed && !cookies.length) cookies.push(sessionCookie(resolved.renewed.token, resolved.renewed.expiresAt));
      for (const cookie of cookies) headers.append("set-cookie", cookie);

      if (result.status === 204 || result.body === undefined) {
        headers.delete("content-type");
        return new Response(null, { status: result.status ?? 204, headers });
      }
      return new Response(JSON.stringify(result.body), { status: result.status ?? 200, headers });
    } catch (e) {
      if (e instanceof ApiError) return errorResponse(e, t);
      // Unexpected: log the detail server-side, tell the user nothing technical.
      log.error("unhandled route error", { message: errorMessage(e), path: req.nextUrl.pathname });
      return errorResponse(new ApiError("INTERNAL_ERROR", 500), t);
    }
  };
}
