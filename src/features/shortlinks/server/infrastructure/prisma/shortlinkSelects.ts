import type { Prisma } from "@prisma/client";

export const shortlinkSelect = {
  id: true,
  code: true,
  merchantId: true,
  target: true,
  targetType: true,
  campaignId: true,
  placeId: true,
  channel: true,
  active: true,
  expiresAt: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  utmTerm: true,
  utmContent: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ShortlinkSelect;

export const shortlinkLiteSelect = {
  id: true,
  code: true,
} satisfies Prisma.ShortlinkSelect;
