import { messageKeyFor, type ApiErrorBody } from "@/shared/api-errors";

/** A failed API call, normalized. `code` is one of the shared API error codes (or NETWORK). */
export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly fields?: Record<string, string>,
    public readonly retryAfterSeconds?: number,
  ) {
    super(code);
    this.name = "ApiRequestError";
  }

  /** Translation key for the form-level message (the UI translates it in the language active right now). */
  get messageKey(): string {
    return messageKeyFor(this.code);
  }
}

export const isApiRequestError = (e: unknown): e is ApiRequestError => e instanceof ApiRequestError;

/** Fired on `window` after every successful write, so pages remembered for instant navigation can be dropped
 *  (see `DataRefresher`). Reads, and the Auto-fill lookup (a POST that changes nothing), do not fire it. */
export const DATA_CHANGED_EVENT = "mystbook:data-changed";

function announceWrite(method: string, path: string) {
  if (method === "GET" || path.endsWith("/ai-fill") || typeof window === "undefined") return;
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
}

/** Turns a non-ok response into the shared ApiRequestError shape (or returns the parsed body when ok). */
async function readResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return (res.status === 204 ? undefined : await res.json().catch(() => undefined)) as T;
  }
  let parsed: ApiErrorBody | null = null;
  try {
    parsed = (await res.json()) as ApiErrorBody;
  } catch {
    /* non-JSON error page (proxy, crash): treated as a server error below */
  }
  const error = parsed?.error;
  const fields = error?.fields ? Object.fromEntries(Object.entries(error.fields).map(([name, f]) => [name, f.key])) : undefined;
  throw new ApiRequestError(error?.code ?? (res.status >= 500 ? "INTERNAL_ERROR" : "VALIDATION_ERROR"), res.status, fields, error?.retryAfterSeconds);
}

/**
 * Thin wrapper over fetch for this app's own API. Sends JSON with the session cookie, and turns every failure
 * (including "the request never arrived") into an ApiRequestError so forms handle a single error type.
 */
export async function apiRequest<T>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      signal,
      headers: body === undefined ? { accept: "application/json" } : { accept: "application/json", "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ApiRequestError("NETWORK", 0);
  }
  const data = await readResponse<T>(res);
  announceWrite(method, path);
  return data;
}

/** Same contract as `apiRequest`, for a multipart upload (a cover photo) — no JSON body, no content-type header
 *  (the browser sets the multipart boundary itself). */
export async function apiUpload<T>(path: string, formData: FormData, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { method: "POST", credentials: "same-origin", cache: "no-store", signal, headers: { accept: "application/json" }, body: formData });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ApiRequestError("NETWORK", 0);
  }
  const data = await readResponse<T>(res);
  announceWrite("POST", path);
  return data;
}
