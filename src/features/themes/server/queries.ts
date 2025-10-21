import type { Prisma } from "@prisma/client";

import { createServerQueries } from "@/server/core/queries/createServerQueries";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import {
  themeFiltersSchema,
  type ThemeFilters,
} from "../model/themeSchema";
import { buildThemeWhere } from "./buildWhere";
import {
  mapThemeLite,
  mapThemeRow,
  type ThemeListDTO,
} from "./mappers";
import { themeQueryPolicy } from "./policy";
import {
  themeLiteSelect,
  themeRepo,
  themeSelect,
} from "./repo";

const themeSortPolicy = makeSortPolicy<ThemeFilters>({
  allowed: ["name", "createdAt"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

const themeLiteSortPolicy = makeSortPolicy<ThemeFilters>({
  allowed: ["name"],
  defaultKey: "name",
  defaultDir: "asc",
});

export const {
  list: listThemesServer,
  getById: getThemeServer,
  listLite: listThemesLiteServer,
  create: createThemeServer,
  update: updateThemeServer,
  remove: removeThemeServer,
} = createServerQueries<
  Prisma.ThemeGetPayload<{ select: typeof themeSelect }>,
  ThemeListDTO,
  Prisma.ThemeWhereInput,
  typeof themeSelect,
  ThemeFilters,
  Prisma.ThemeGetPayload<{ select: typeof themeLiteSelect }>,
  { value: string; label: string },
  typeof themeLiteSelect,
  Prisma.ThemeCreateInput,
  Prisma.ThemeUpdateInput
>({
  repo: themeRepo,
  policy: themeQueryPolicy,
  filterSchema: themeFiltersSchema,
  buildWhere: buildThemeWhere,
  tenantKey: "merchantId",
  select: themeSelect,
  mapRow: mapThemeRow,
  sort: themeSortPolicy,
  lite: {
    select: themeLiteSelect,
    mapLite: mapThemeLite,
    defaultLimit: 20,
    maxLimit: 50,
    sort: themeLiteSortPolicy,
  },
});

export type { ThemeListDTO as ThemeListItem };
