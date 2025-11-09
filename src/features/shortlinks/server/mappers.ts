import type { Prisma } from "@prisma/client";

import type { Shortlink } from "@/types/domain";

import { shortlinkLiteSelect, shortlinkSelect } from "./infrastructure/prisma/shortlinkSelects";

export type ShortlinkSelectRow = Prisma.ShortlinkGetPayload<{ select: typeof shortlinkSelect }>;
export type ShortlinkLiteRow = Prisma.ShortlinkGetPayload<{ select: typeof shortlinkLiteSelect }>;

export const mapShortlinkRow = (row: ShortlinkSelectRow): Shortlink => ({
  id: row.id,
  code: row.code,
  merchantId: row.merchantId,
  landingId: row.landingId ?? null,
  landing: row.landing
    ? {
        id: row.landing.id,
        name: row.landing.name ?? null,
      }
    : null,
  campaignId: row.campaignId ?? null,
  placeId: row.placeId ?? null,
  channel: row.channel ?? undefined,
  active: row.active,
  expiresAt: row.expiresAt ?? undefined,
  utm: buildUtm(row),
  createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : (row.createdAt as unknown as string),
  updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : (row.updatedAt as unknown as string),
});

export const mapShortlinkLite = (row: ShortlinkLiteRow) => ({
  value: row.id,
  label: row.code,
});

function buildUtm(row: ShortlinkSelectRow): Shortlink["utm"] {
  const source = row.utmSource ?? undefined;
  const medium = row.utmMedium ?? undefined;
  const campaign = row.utmCampaign ?? undefined;
  const term = row.utmTerm ?? undefined;
  const content = row.utmContent ?? undefined;

  const hasValue =
    source !== undefined ||
    medium !== undefined ||
    campaign !== undefined ||
    term !== undefined ||
    content !== undefined;

  if (!hasValue) {
    return undefined;
  }

  return {
    source,
    medium,
    campaign,
    term,
    content,
  };
}
