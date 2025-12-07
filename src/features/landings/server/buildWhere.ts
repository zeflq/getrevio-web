import type { Prisma } from "@/generated/client";

import type { LandingFilters } from "../model/landingSchema";

export const buildLandingWhere = (
  filters: LandingFilters,
  tenantId?: string
): Prisma.LandingWhereInput => ({
  ...(filters.q
    ? {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { slug: { contains: filters.q, mode: "insensitive" } },
        ],
      }
    : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
  ...(tenantId ? { merchantId: tenantId } : {}),
});
