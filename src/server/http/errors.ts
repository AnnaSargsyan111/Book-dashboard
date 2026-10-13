import type { ApiErrorCode } from "@/shared/api-errors";

/**
 * A failure the API deliberately reports. `fields` holds validation KEYS (not text); the route factory localizes
 * everything into the request's language when it builds the response.
 */
export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    public readonly status: number,
    public readonly options: { fields?: Record<string, string>; retryAfterSeconds?: number } = {},
  ) {
    super(code);
    this.name = "ApiError";
  }

  get fields() {
    return this.options.fields;
  }

  get retryAfterSeconds() {
    return this.options.retryAfterSeconds;
  }
}
