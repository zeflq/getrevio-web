import type { Prisma } from "@prisma/client";

import { createServerQueries } from "@/server/core/queries/createServerQueries";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import {
  placeFiltersSchema,
  type PlaceFilters,
} from "../model/placeSchema";
import { buildPlaceWhere } from "./buildWhere";
import {
  mapPlaceLite,
  mapPlaceRow,
  type PlaceListDTO,
} from "./mappers";
import { placeQueryPolicy } from "./policy";
import {
  placeLiteSelect,
  placeRepo,
  placeSelect,
} from "./repo";

const placeSortPolicy = makeSortPolicy<PlaceFilters>({
  allowed: ["localName", "createdAt"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

const placeLiteSortPolicy = makeSortPolicy<PlaceFilters>({
  allowed: ["localName"],
  defaultKey: "localName",
  defaultDir: "asc",
});

export const {
  list: listPlacesServer,
  getById: getPlaceServer,
  listLite: listPlacesLiteServer,
  create: createPlaceServer,
  update: updatePlaceServer,
  remove: removePlaceServer,
} = createServerQueries<
  Prisma.PlaceGetPayload<{ select: typeof placeSelect }>,
  PlaceListDTO,
  Prisma.PlaceWhereInput,
  typeof placeSelect,
  PlaceFilters,
  Prisma.PlaceGetPayload<{ select: typeof placeLiteSelect }>,
  { value: string; label: string },
  typeof placeLiteSelect,
  Prisma.PlaceCreateInput,
  Prisma.PlaceUpdateInput
>({
  repo: placeRepo,
  policy: placeQueryPolicy,
  filterSchema: placeFiltersSchema,
  buildWhere: buildPlaceWhere,
  tenantKey: "merchantId",
  select: placeSelect,
  mapRow: mapPlaceRow,
  sort: placeSortPolicy,
  lite: {
    select: placeLiteSelect,
    mapLite: mapPlaceLite,
    defaultLimit: 20,
    maxLimit: 50,
    sort: placeLiteSortPolicy,
  },
});

export type { PlaceListDTO as PlaceListItem };
