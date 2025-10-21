import type { Prisma } from "@prisma/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { CampaignFilters } from "../model/campaignSchema";

export const campaignQueryPolicy = createQueryPolicy<CampaignFilters, Prisma.CampaignWhereInput>({
  maxPageSize: 100,
  maxWindow: 5000,
  requireTenant: false,
});
