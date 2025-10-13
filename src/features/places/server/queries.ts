// features/places/server/queries.ts
import prisma from "@/lib/prisma";
// import { Prisma } from "@prisma/client";

import { createServerQueries } from "@/lib/helpers/createServerQueries";
import { placeFiltersSchema, type PlaceFilters } from "../model/placeSchema";

const orderByMain = (filters: { sort: "localName" | "createdAt"; order: "asc" | "desc" }) => ({
  [filters.sort]: filters.order,
});

const orderByLite = () => ({ localName: "asc" as const });

const select = {
  id: true,
  merchantId: true,
  localName: true,
  slug: true,
  address: true,
  themeId: true,
  landingDefaults: true,
  googlePlaceId: true,
  createdAt: true,
  updatedAt: true,
} ;


type PlaceListDTO = {
  id: string;
  merchantId: string;
  localName: string;
  slug: string;
  address?: string;
  themeId?: string;
  landingDefaults?: Record<string, unknown>;
  googlePlaceId?: string;
  createdAt: string;
  updatedAt: string;
};

export const {
  list: listPlacesServer,
  getById: getPlaceServer,
  listLite: listPlacesLiteServer,
} = createServerQueries({
  delegate: prisma.place,
  filterSchema: placeFiltersSchema,
  buildWhere: (filters) => ({
    ...(filters.q
      ? {
          OR: [
            { localName: { contains: filters.q, mode: "insensitive" } },
            { slug: { contains: filters.q, mode: "insensitive" } },
            { address: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
  }),
  orderBy: orderByMain,
  select,
  lite: {
    select: { id: true, localName: true },
    orderBy: orderByLite,
    // mapLite: (row: { id: string; localName: string | null }) => ({
    //   value: row.id,
    //   label: row.localName ?? row.id,
    // }),
  },
});

export type { PlaceListDTO as PlaceListItem };
