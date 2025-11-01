import { createSafeActionClient } from "next-safe-action";
import { ActionError } from "@/lib/action-error";
import { getServerSession } from "@/lib/auth-server";
import type { Role } from "@/server/core/utils/resolveTenantScope";
import { headers as serverHeaders } from "next/headers";
import { SUPER_ADMIN } from "@/lib/utils";

export type ServerErr = { code: number; message: string };

export type AuthContext = {
  user: { id: string; tenantId?: string; roles?: string[]; email?: string };
  headers: Headers;
  tenantId?: string;
  isSuperAdmin: boolean;
};

// Unified error mapping
function mapError(e: unknown): ServerErr {
  if (e instanceof ActionError) return { code: e.code, message: e.message };
  if (e instanceof Error) return { code: 500, message: e.message };
  return { code: 500, message: "UNKNOWN_ERROR" };
}

// Base action client with error handling
export const actionUser = createSafeActionClient<undefined, ServerErr>({
  handleServerError: (e: unknown): ServerErr => mapError(e),
});

// ---- Middlewares ----

// 1) Attach auth context once
export const withAuth = actionUser.use(async ({ next }) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const hdrs = await serverHeaders();

  const role: Role =
    (session.user?.globalRole === SUPER_ADMIN ? "SUPER_ADMIN" : "TENANT_USER") as Role;
  
  // Extract tenant ID from session
  const tenantId = (session as any)?.session?.activeOrganizationId ?? null;

  return next({
    ctx: {
      user: {
        id: session.user.id as string,
        tenantId: tenantId ?? undefined,
        email: (session.user as { email?: string })?.email ?? undefined,
        roles: session.user?.globalRole ? [session.user.globalRole] : undefined,
      },
      headers: hdrs,
      tenantId: tenantId ?? undefined,
      isSuperAdmin: role === "SUPER_ADMIN",
    } as AuthContext,
  });
});

// 2) Require an orgId field on input (by key) and assert access
export function withTenantGuard<Key extends string>(key: Key) {
  return withAuth.use(async ({ next, ctx, clientInput }) => {
    const tenantId = (clientInput as Record<string, unknown>)[key] as string | undefined;
    if (!tenantId) throw new ActionError(400, "TENANT_REQUIRED");

    // just check consistency
    if (!ctx.isSuperAdmin && tenantId !== ctx.tenantId) {
      throw new ActionError(403, "FORBIDDEN");
    }

    return next({ ctx: {...ctx, tenantId} });
  });
}

// 3) Optional: require super-admin only
export const withSuperAdmin = withAuth.use(async ({ next, ctx }) => {
  if (!ctx.isSuperAdmin) throw new ActionError(403, "FORBIDDEN");
  return next({
    ctx,
  } as { ctx: AuthContext });
});
