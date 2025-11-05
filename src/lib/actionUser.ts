import { createSafeActionClient } from "next-safe-action";
import { ActionError } from "@/lib/action-error";
import {
  assertSuperAdmin,
  assertTenantAccess,
  GuardAuthError,
  resolveAuthContext,
  type AuthContext,
} from "@/server/core/guards/authGuards";
export type { AuthContext } from "@/server/core/guards/authGuards";

export type ServerErr = { code: number; message: string };

// Unified error mapping
function mapError(e: unknown): ServerErr {
  if (e instanceof ActionError) return { code: e.code, message: e.message };
  if (e instanceof Error) return { code: 500, message: e.message };
  return { code: 500, message: "UNKNOWN_ERROR" };
}

function rethrowAsActionError(error: unknown): never {
  if (error instanceof GuardAuthError) {
    throw new ActionError(error.status, error.message);
  }
  throw error;
}

// Base action client with error handling
export const actionUser = createSafeActionClient<undefined, ServerErr>({
  handleServerError: (e: unknown): ServerErr => mapError(e),
});

// ---- Middlewares ----

// 1) Attach auth context once
export const withAuth = actionUser.use(async ({ next }) => {
  try {
    const ctx = await resolveAuthContext();
    return next({ ctx });
  } catch (error) {
    rethrowAsActionError(error);
  }
});

// 2) Require an orgId field on input (by key) and assert access
export function withTenantGuard<Key extends string>(key: Key) {
  return withAuth.use(async ({ next, ctx, clientInput }) => {
    const requestedTenantId = (clientInput as Record<string, unknown>)[key] as
      | string
      | undefined;
    try {
      const tenantId = assertTenantAccess(ctx, requestedTenantId);
      return next({ ctx: { ...ctx, tenantId } });
    } catch (error) {
      rethrowAsActionError(error);
    }
  });
}

// 3) Optional: require super-admin only
export const withSuperAdmin = withAuth.use(async ({ next, ctx }) => {
  try {
    assertSuperAdmin(ctx);
    return next({ ctx } as { ctx: AuthContext });
  } catch (error) {
    rethrowAsActionError(error);
  }
});
