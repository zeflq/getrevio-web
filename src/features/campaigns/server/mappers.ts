import type { Prisma } from "@prisma/client";

import { campaignSelect } from "./infrastructure/prisma/campaignSelects";

export type CampaignSelectRow = Prisma.CampaignGetPayload<{ select: typeof campaignSelect }>;

export type CampaignListDTO = {
  id: string;
  merchantId: string;
  merchantName?: string | null;
  placeId: string;
  placeName?: string | null;
  themeId?: string | null;
  themeName?: string | null;
  name: string;
  slug: string | null;
  status: "draft" | "active" | "archived";
  startAt?: string | null;
  endAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
};

export const mapCampaignRow = (row: CampaignSelectRow): CampaignListDTO => ({
  id: row.id,
  merchantId: row.merchantId,
  merchantName: row.merchant?.name ?? null,
  placeId: row.placeId,
  placeName: row.place?.localName ?? null,
  themeId: row.themeId ?? null,
  themeName: row.theme?.name ?? null,
  name: row.name,
  slug: row.slug ?? null,
  status: row.status,
  startAt: toIsoString(row.startAt),
  endAt: toIsoString(row.endAt),
  createdAt: toIsoString(row.createdAt) ?? "",
  updatedAt: toIsoString(row.updatedAt) ?? "",
});
