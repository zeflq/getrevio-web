import type { Prisma } from "@prisma/client";

import type { CampaignFilters } from "../model/campaignSchema";

export const buildCampaignWhere = (
  filters: CampaignFilters,
  _tenantId?: string
): Prisma.CampaignWhereInput => ({
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
  ...(filters.placeId ? { placeId: filters.placeId } : {}),
});
