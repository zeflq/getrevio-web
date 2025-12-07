import type { Prisma } from "@/generated/client";

import type { PlaceFilters } from "../model/placeSchema";

export const buildPlaceWhere = (
  filters: PlaceFilters,
  tenantId?: string
): Prisma.PlaceWhereInput => ({
  ...(filters.hasGooglePlaceId === true
    ? { googlePlaceId: { not: null } }
    : {}),
  ...(filters.hasGooglePlaceId === false ? { googlePlaceId: null } : {}),
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
