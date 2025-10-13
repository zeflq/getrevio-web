// features/themes/server/queries.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { createServerQueries } from "@/lib/helpers/createServerQueries";
import { themeFiltersSchema, type ThemeFilters } from "../model/themeSchema";

const orderByMain = (filters: { sort: "name" | "createdAt"; order: "asc" | "desc" }) => ({
  [filters.sort]: filters.order,
});

const orderByLite = () => ({ name: "asc" as const });

const select = {
  id: true,
  merchantId: true,
  name: true,
  logoUrl: true,
  brandColor: true,
  accentColor: true,
  textColor: true,
  meta: true,
  createdAt: true,
  updatedAt: true,
} ;

type ThemeSelectRow = Prisma.ThemeGetPayload<{ select: typeof select }>;

type ThemeListDTO = {
  id: string;
  merchantId: string;
  name: string;
  logoUrl?: string;
  brandColor?: string;
  accentColor?: string;
  textColor?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export const {
  list: listThemesServer,
  getById: getThemeServer,
  listLite: listThemesLiteServer,
} = createServerQueries({
  delegate: prisma.theme,
  filterSchema: themeFiltersSchema,
  buildWhere: (filters) => ({
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
            { logoUrl: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
    ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
  }),
  orderBy: orderByMain,
  select,
  lite: {
    select: { id: true, name: true },
    orderBy: orderByLite,
  },
});

export type { ThemeListDTO as ThemeListItem };
