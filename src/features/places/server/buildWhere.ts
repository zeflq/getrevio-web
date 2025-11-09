import type { Prisma } from "@prisma/client";

import type { PlaceFilters } from "../model/placeSchema";

export const buildPlaceWhere = (
  filters: PlaceFilters,
  tenantId?: string
): Prisma.PlaceWhereInput => ({
  ...(filters.q
    ? {
        localName: { contains: filters.q, mode: "insensitive" },
      }
    : {}),
  ...(filters.localName
    ? {
        localName: { contains: filters.localName, mode: "insensitive" },
      }
    : {}),
  ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
  ...(tenantId ? { merchantId: tenantId } : {}),
});
