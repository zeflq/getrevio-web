import type { Prisma } from "@prisma/client";

import { createServerQueries } from "@/server/core/queries/createServerQueries";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import {
  merchantFiltersSchema,
  type MerchantFilters,
} from "../model/merchantSchema";
import { buildMerchantWhere } from "./buildWhere";
import {
  mapMerchantLite,
  mapMerchantRow,
  type MerchantListDTO,
} from "./mappers";
import { merchantQueryPolicy } from "./policy";
import {
  merchantLiteSelect,
  merchantRepo,
  merchantSelect,
} from "./repo";

const merchantSortPolicy = makeSortPolicy<MerchantFilters>({
  allowed: ["name", "createdAt", "plan", "status"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

const merchantLiteSortPolicy = makeSortPolicy<MerchantFilters>({
  allowed: ["name"],
  defaultKey: "name",
  defaultDir: "asc",
});

export const {
  list: listMerchantsServer,
  getById: getMerchantServer,
  listLite: listMerchantsLiteServer,
} = createServerQueries<
  Prisma.MerchantGetPayload<{ select: typeof merchantSelect }>,
  MerchantListDTO,
  Prisma.MerchantWhereInput,
  typeof merchantSelect,
  MerchantFilters,
  Prisma.MerchantGetPayload<{ select: typeof merchantLiteSelect }>,
  { value: string; label: string },
  typeof merchantLiteSelect
>({
  repo: merchantRepo,
  policy: merchantQueryPolicy,
  filterSchema: merchantFiltersSchema,
  buildWhere: buildMerchantWhere,
  tenantKey: "tenantId",
  select: merchantSelect,
  mapRow: mapMerchantRow,
  sort: merchantSortPolicy,
  lite: {
    select: merchantLiteSelect,
    mapLite: mapMerchantLite,
    defaultLimit: 20,
    maxLimit: 50,
    sort: merchantLiteSortPolicy,
  },
});

export type { MerchantListDTO as MerchantListItem };
