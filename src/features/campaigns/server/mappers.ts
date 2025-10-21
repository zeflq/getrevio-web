import type { Prisma } from "@prisma/client";

import { campaignSelect } from "./repo";

export type CampaignSelectRow = Prisma.CampaignGetPayload<{ select: typeof campaignSelect }>;

export type CampaignListDTO = {
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

export const mapCampaignRow = (row: CampaignSelectRow): CampaignListDTO => ({
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
