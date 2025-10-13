// src/features/shortlinks/server/queries.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client/index";

import { createServerQueries } from "@/lib/helpers/createServerQueries";
import type { Shortlink } from "@/types/domain";
import { shortlinkFiltersSchema } from "../model/shortlinkSchema";

const orderByMain = (filters: {
  sort?: "code" | "merchantId" | "channel" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}) => ({
  [filters.sort ?? "createdAt"]:
    (filters.order ?? "desc") as Prisma.SortOrder,
});

const select = {
  id: true,
  code: true,
  merchantId: true,
  target: true,
  channel: true,
  themeId: true,
  active: true,
  expiresAt: true,
  utm: true,
  createdAt: true,
  updatedAt: true,
};

type ShortlinkRow = Prisma.ShortlinkGetPayload<{ select: typeof select }>;

const mapRow = (row: ShortlinkRow): Shortlink => ({
  id: row.id,
  code: row.code,
  merchantId: row.merchantId,
  target: row.target as Shortlink["target"],
  channel: row.channel ?? undefined,
  themeId: row.themeId ?? undefined,
  active: row.active,
  expiresAt: row.expiresAt,
  utm: row.utm as Shortlink["utm"],
  createdAt: row.createdAt.toISOString?.() ?? (row.createdAt as unknown as string),
  updatedAt: row.updatedAt.toISOString?.() ?? (row.updatedAt as unknown as string),
});

export const {
  list: listShortlinksServer,
  getById: getShortlinkServer,
} = createServerQueries({
  delegate: prisma.shortlink,
  filterSchema: shortlinkFiltersSchema,
  buildWhere: (filters) => ({
    ...(filters.q
      ? {
          OR: [
            { code: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
            {
              channel: {
                contains: filters.q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {}),
    ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
    ...(filters.channel ? { channel: filters.channel } : {}),
    ...(filters.status
      ? { active: filters.status === "active" }
      : {}),
  }),
  orderBy: orderByMain,
  select,
  mapRow,
});

export type ShortlinkListItem = Shortlink;
