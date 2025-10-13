// features/campaigns/server/queries.ts
import prisma from "@/lib/prisma";

import { createServerQueries } from "@/lib/helpers/createServerQueries";
import {
  campaignFiltersSchema,
  type CampaignFilters,
} from "../model/campaignSchema";

const orderByMain = (filters: CampaignFilters) => ({
  [filters.sort]: filters.order,
});

const orderByLite = () => ({ name: "asc" as const });

const select = {
  id: true,
  merchantId: true,
  placeId: true,
  name: true,
  slug: true,
  primaryCtaUrl: true,
  status: true,
  theme: true,
  startAt: true,
  endAt: true,
  createdAt: true,
  updatedAt: true,
  merchant: {
    select: {
      name: true,
    },
  },
  place: {
    select: {
      localName: true,
    },
  },
};

type CampaignSelectRow = {
  id: string;
  merchantId: string;
  placeId: string;
  name: string;
  slug: string | null;
  primaryCtaUrl: string;
  status: "draft" | "active" | "archived";
  theme?: Record<string, unknown> | null;
  startAt?: Date | string | null;
  endAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  merchant?: { name?: string | null } | null;
  place?: { localName?: string | null } | null;
};

type CampaignListDTO = {
  id: string;
  merchantId: string;
  merchantName?: string | null;
  placeId: string;
  placeName?: string | null;
  name: string;
  slug: string | null;
  primaryCtaUrl: string;
  status: "draft" | "active" | "archived";
  theme?: Record<string, unknown> | null;
  startAt?: string | null;
  endAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
};

const mapRow = (row: CampaignSelectRow): CampaignListDTO => ({
  id: row.id,
  merchantId: row.merchantId,
  merchantName: row.merchant?.name ?? null,
  placeId: row.placeId,
  placeName: row.place?.localName ?? null,
  name: row.name,
  slug: row.slug ?? null,
  primaryCtaUrl: row.primaryCtaUrl,
  status: row.status,
  theme: (row.theme ?? null) as Record<string, unknown> | null,
  startAt: toIsoString(row.startAt),
  endAt: toIsoString(row.endAt),
  createdAt: toIsoString(row.createdAt) ?? "",
  updatedAt: toIsoString(row.updatedAt) ?? "",
});

export const {
  list: listCampaignsServer,
  getById: getCampaignServer,
  listLite: listCampaignsLiteServer,
} = createServerQueries({
  delegate: prisma.campaign,
  filterSchema: campaignFiltersSchema,
  buildWhere: (filters) => ({
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { slug: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
    ...(filters.placeId ? { placeId: filters.placeId } : {}),
  }),
  orderBy: orderByMain,
  select,
  mapRow,
  lite: {
    select: {
      id: true,
      name: true,
    },
    orderBy: orderByLite,
  },
});

export type { CampaignListDTO as CampaignListItem };
