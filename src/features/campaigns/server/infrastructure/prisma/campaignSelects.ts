import type { Prisma } from "@prisma/client";

export const campaignSelect = {
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
} satisfies Prisma.CampaignSelect;

export const campaignLiteSelect = {
  id: true,
  name: true,
} satisfies Prisma.CampaignSelect;
