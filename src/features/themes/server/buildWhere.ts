import type { Prisma } from "@/generated/client";

import type { ThemeFilters } from "../model/themeSchema";

export const buildThemeWhere = (
  filters: ThemeFilters,
  tenantId?: string
): Prisma.ThemeWhereInput => ({
  ...(filters.q
    ? {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
        ],
      }
    : {}),
  ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
  ...(tenantId ? { merchantId: tenantId } : {}),
});
