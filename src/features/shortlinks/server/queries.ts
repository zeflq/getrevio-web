import type { Prisma } from "@prisma/client";

import { createServerQueries } from "@/server/core/queries/createServerQueries";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import { shortlinkFiltersSchema, type ShortlinkFilters } from "../model/shortlinkSchema";
import { buildShortlinkWhere } from "./buildWhere";
import { mapShortlinkRow } from "./mappers";
import { shortlinkQueryPolicy } from "./policy";
import { shortlinkRepo, shortlinkSelect } from "./repo";

import type { Shortlink } from "@/types/domain";

const shortlinkSortPolicy = makeSortPolicy<ShortlinkFilters>({
  allowed: ["code", "merchantId", "channel", "createdAt", "updatedAt"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

export const {
  list: listShortlinksServer,
  getById: getShortlinkServer,
  create: createShortlinkServer,
  update: updateShortlinkServer,
  remove: removeShortlinkServer,
} = createServerQueries<
  Prisma.ShortlinkGetPayload<{ select: typeof shortlinkSelect }>,
  Shortlink,
  Prisma.ShortlinkWhereInput,
  typeof shortlinkSelect,
  ShortlinkFilters,
  Prisma.ShortlinkGetPayload<{ select: typeof shortlinkSelect }>,
  Shortlink,
  typeof shortlinkSelect,
  Prisma.ShortlinkCreateInput,
  Prisma.ShortlinkUpdateInput
>({
  repo: shortlinkRepo,
  policy: shortlinkQueryPolicy,
  filterSchema: shortlinkFiltersSchema,
  buildWhere: buildShortlinkWhere,
  tenantKey: "merchantId",
  select: shortlinkSelect,
  mapRow: mapShortlinkRow,
  sort: shortlinkSortPolicy,
});

export type { Shortlink as ShortlinkListItem };
