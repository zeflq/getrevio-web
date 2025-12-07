import type { Prisma } from "@/generated/client";

import type { CampaignFilters } from "../model/campaignSchema";

export const buildCampaignWhere = (
  filters: CampaignFilters,
  tenantId?: string
): Prisma.CampaignWhereInput => ({
  ...(filters.q
    ? {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
        ],
      }
    : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
  ...(filters.placeId ? { placeId: filters.placeId } : {}),
  ...(tenantId ? { merchantId: tenantId } : {}),
});
