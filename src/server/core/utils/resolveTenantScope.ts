import { ActionError } from "@/lib/action-error";

export type Role = "TENANT_USER" | "SUPER_ADMIN";

export interface UserContext {
  id: string;
  role: Role;
  tenantId?: string | null;
}

export interface TenantScopeOptions {
  tenantIdOverride?: string | null;
}

export interface TenantScopeResult {
  tenantId?: string;
}

/**
 * Resolve the effective tenant scope for the current user.
 * - Super admins may stay global or target a tenant via `tenantIdOverride`.
 * - Tenant users are always scoped to their tenant and may not override it.
 * - Any attempted override for tenant users results in a 403 ActionError.
 * - Missing tenant association for tenant users results in a 400 ActionError.
 */
export function resolveTenantScope(
  user: UserContext,
  filters: Record<string, unknown> = {},
  options?: TenantScopeOptions
): TenantScopeResult {
  if (!user) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  if (user.role === "SUPER_ADMIN") {
    const tenantId =
      typeof options?.tenantIdOverride === "string" && options.tenantIdOverride.trim().length > 0
        ? options.tenantIdOverride.trim()
        : undefined;

    return { tenantId };
  }

  const tenantId = user.tenantId?.trim();
  if (!tenantId) {
    throw new ActionError(400, "TENANT_MISSING");
  }

  if (options?.tenantIdOverride && options.tenantIdOverride !== tenantId) {
    throw new ActionError(403, "TENANT_OVERRIDE_FORBIDDEN");
  }

  if ("tenantId" in filters) {
    delete filters.tenantId;
  }

  return { tenantId };
}
