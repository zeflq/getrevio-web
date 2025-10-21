import type { Prisma } from "@prisma/client";

import type { MerchantFilters } from "../model/merchantSchema";

export const buildMerchantWhere = (
  filters: MerchantFilters,
  tenantId?: string
): Prisma.MerchantWhereInput => ({
  ...(filters.q
    ? {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { email: { contains: filters.q, mode: "insensitive" } },
        ],
      }
    : {}),
  ...(filters.plan ? { plan: filters.plan } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(tenantId ? { tenantId } : {}),
});
