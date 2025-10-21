export type PagedFilters = {
  page: number;
  pageSize: number;
  sort?: string;
  dir?: "asc" | "desc";
};

export type QueryPolicy<TFilters extends PagedFilters, TWhere> = {
  requireTenant?: boolean;
  maxPageSize: number;
  maxWindow: number;
  enforceTenant(where: TWhere, tenantId: string | undefined, tenantKey?: string): TWhere;
  validateAndClamp(filters: TFilters): TFilters;
};

type QueryPolicyOptions<TFilters extends PagedFilters, TWhere> = {
  requireTenant?: boolean;
  maxPageSize?: number;
  maxWindow?: number;
  tenantKey?: string;
  clamp?: (filters: TFilters) => TFilters;
  enforceTenant?: (where: TWhere, tenantId: string | undefined, tenantKey?: string) => TWhere;
};

/**
 * Builds a default query policy with sane pagination & tenant enforcement.
 */
export function createQueryPolicy<TFilters extends PagedFilters, TWhere>(
  opts: QueryPolicyOptions<TFilters, TWhere> = {}
): QueryPolicy<TFilters, TWhere> {
  const maxPageSize = Math.max(1, opts.maxPageSize ?? 100);
  const maxWindow = Math.max(maxPageSize, opts.maxWindow ?? maxPageSize * 50);
  const tenantKey = opts.tenantKey ?? "tenantId";

  const defaultEnforceTenant = (where: TWhere, tenantId?: string, providedTenantKey?: string): TWhere => {
    if (!tenantId) return where;
    const key = providedTenantKey ?? tenantKey;
    return {
      ...(where as unknown as Record<string, unknown>),
      [key]: tenantId,
    } as unknown as TWhere;
  };

  return {
    requireTenant: opts.requireTenant ?? false,
    maxPageSize,
    maxWindow,
    enforceTenant: opts.enforceTenant ?? defaultEnforceTenant,
    validateAndClamp: (filters: TFilters) => {
      const clamped = opts.clamp ? opts.clamp(filters) : filters;
      const page = Number.isFinite(clamped.page) ? Math.max(1, clamped.page) : 1;
      const pageSize = Number.isFinite(clamped.pageSize)
        ? Math.max(1, Math.min(clamped.pageSize, maxPageSize))
        : maxPageSize;

      return {
        ...clamped,
        page,
        pageSize,
      };
    },
  };
}
