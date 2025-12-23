import type { Prisma } from "@/generated/client";

import { landingSelect, landingLiteSelect } from "./infrastructure/prisma/landingSelects";
import { ensureLandingContentShape, LandingContent } from "../model/landingContentSchema";

export type LandingSelectRow = Prisma.LandingGetPayload<{ select: typeof landingSelect }>;
export type LandingLiteRow = Prisma.LandingGetPayload<{ select: typeof landingLiteSelect }>;

export type LandingListDTO = {
  id: string;
  merchantId: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  contentDraft: LandingContent;
  contentPublished?: LandingContent | null;
  templateId?: string | null;
  themeId?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  belongsTo?: {
    type: "place" | "campaign";
    id: string;
    label?: string | null;
    googlePlaceId?: string | null;
  } | null;
};

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
};

const deriveBelongsTo = (
  row: LandingSelectRow
): LandingListDTO["belongsTo"] => {
  const campaign = row.campaigns?.[0];
  if (campaign) {
    return {
      type: "campaign",
      id: campaign.id,
      label: campaign.name,
      googlePlaceId: campaign.place?.googlePlaceId ?? null,
    };
  }

  const place = row.places?.[0];
  if (place) {
    return {
      type: "place",
      id: place.id,
      label: place.localName,
      googlePlaceId: place.googlePlaceId ?? null,
    };
  }

  return null;
};

export const mapLandingRow = (row: LandingSelectRow): LandingListDTO => ({
  id: row.id,
  merchantId: row.merchantId,
  name: row.name,
  slug: row.slug,
  status: row.status,
  contentDraft: ensureLandingContentShape(
    row.contentDraft as LandingContent | null | undefined
  ),
  contentPublished: row.contentPublished
    ? ensureLandingContentShape(row.contentPublished as LandingContent)
    : null,
  templateId: row.templateId ?? null,
  themeId: row.themeId ?? null,
  publishedAt: toIsoString(row.publishedAt),
  createdAt: toIsoString(row.createdAt) ?? "",
  updatedAt: toIsoString(row.updatedAt) ?? "",
  belongsTo: deriveBelongsTo(row),
});

export const mapLandingLite = (row: LandingLiteRow) => ({
  value: row.id,
  label: row.name ?? row.id,
});

export type { LandingListDTO as LandingListItem };
