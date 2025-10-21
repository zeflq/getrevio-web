import type { Prisma } from "@prisma/client";

import type { PlaceFilters } from "../model/placeSchema";

export const buildPlaceWhere = (
  filters: PlaceFilters,
  tenantId?: string
): Prisma.PlaceWhereInput => ({
  ...(filters.q
    ? {
        OR: [
          { localName: { contains: filters.q, mode: "insensitive" } },
          { slug: { contains: filters.q, mode: "insensitive" } },
        ],
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
