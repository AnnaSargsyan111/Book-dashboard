import { after } from "next/server";
import { errorMessage, log } from "@/server/log";

/**
 * Run work without holding up the HTTP response (for example sending an email). Doing it off the request path also
 * keeps "account exists" and "unknown account" responses equally fast. Outside a request (tests, scripts) `after`
 * is unavailable and the task simply runs in the background.
 */
export function runAfterResponse(name: string, task: () => Promise<void>): void {
  const promise = task().catch((e) => log.error(`background task failed: ${name}`, { message: errorMessage(e) }));
  try {
    after(promise);
  } catch {
    /* not in a request scope */
  }
}
