import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { PublicUser } from "@/shared/api-errors";
import { sessionCookieName } from "./cookie";
import { resolveSession } from "./session.service";

/**
 * The signed-in user for the current server render, or null. Cached per request. Read-only: server components
 * cannot set cookies, so the sliding-expiry renewal happens in the API routes instead.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const token = (await cookies()).get(sessionCookieName())?.value;
  if (!token) return null;
  const resolved = await resolveSession(token, { slide: false });
  return resolved?.user ?? null;
});
