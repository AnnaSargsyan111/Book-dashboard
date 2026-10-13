/** Minimal server logging. Never log passwords, tokens or full request bodies. */
type Meta = Record<string, unknown>;

const write = (level: "warn" | "error", message: string, meta?: Meta) => {
  if (process.env.NODE_ENV === "test" && !process.env.LOG_IN_TESTS) return;
  const line = JSON.stringify({ level, message, ...meta, at: new Date().toISOString() });
  (level === "error" ? console.error : console.warn)(line);
};

export const log = {
  warn: (message: string, meta?: Meta) => write("warn", message, meta),
  error: (message: string, meta?: Meta) => write("error", message, meta),
};

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));
