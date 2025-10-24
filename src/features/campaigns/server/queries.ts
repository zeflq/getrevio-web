import type { Prisma } from "@prisma/client";

import { createServerQueries } from "@/server/core/queries/createServerQueries";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import {
  campaignFiltersSchema,
  type CampaignFilters,
} from "../model/campaignSchema";
import { buildCampaignWhere } from "./buildWhere";
import { mapCampaignRow, type CampaignListDTO } from "./mappers";
import { campaignQueryPolicy } from "./policy";
import {
  campaignLiteSelect,
  campaignRepo,
  campaignSelect,
} from "./repo";

const campaignSortPolicy = makeSortPolicy<CampaignFilters>({
  allowed: ["name", "createdAt", "status"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

const campaignLiteSortPolicy = makeSortPolicy<CampaignFilters>({
  allowed: ["name"],
  defaultKey: "name",
  defaultDir: "asc",
});

export const {
  list: listCampaignsServer,
  getById: getCampaignServer,
  listLite: listCampaignsLiteServer,
} = createServerQueries<
  Prisma.CampaignGetPayload<{ select: typeof campaignSelect }>,
  CampaignListDTO,
  Prisma.CampaignWhereInput,
  typeof campaignSelect,
  CampaignFilters,
  Prisma.CampaignGetPayload<{ select: typeof campaignLiteSelect }>,
  { value: string; label: string },
  typeof campaignLiteSelect
>({
  repo: campaignRepo,
  policy: campaignQueryPolicy,
  filterSchema: campaignFiltersSchema,
  buildWhere: buildCampaignWhere,
  tenantKey: "merchantId",
  idKey: "id",
  select: campaignSelect,
  mapRow: mapCampaignRow,
  sort: campaignSortPolicy,
  lite: {
    select: campaignLiteSelect,
    defaultLimit: 20,
    maxLimit: 50,
    sort: campaignLiteSortPolicy,
  },
});

export type { CampaignListDTO as CampaignListItem };
