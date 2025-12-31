/**
 * @deprecated This file is deprecated. Use @/lib/auth/server.ts instead.
 *
 * Migration path:
 * - Replace getServerSession() with getSession() from @/lib/auth/server
 * - New implementation uses /auth/me endpoint instead of better-auth server-side
 */

// src/lib/auth-server.ts
import { headers as serverHeaders } from "next/headers";
import { auth } from "@/lib/auth";

type GetSessionInit = { headers?: Headers | HeadersInit | Promise<Headers | HeadersInit> };

export async function getSessionFromInit(init?: GetSessionInit) {
  // Normalise en Headers | HeadersInit en résolvant si c'est une Promise
  const candidate = init?.headers ?? serverHeaders();
  const hdrs = await Promise.resolve(candidate);

  return auth.api.getSession({
    query: { disableCookieCache: true },
    headers: hdrs,
  });
}

export async function getServerSession() {
  const data = await getSessionFromInit();
  return data ?? null;
}
