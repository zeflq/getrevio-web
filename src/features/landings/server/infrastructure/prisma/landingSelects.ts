import type { Prisma } from "@prisma/client";

export const landingSelect = {
  id: true,
  merchantId: true,
  name: true,
  status: true,
  content: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  places: {
    select: {
      id: true,
      localName: true,
      merchantId: true,
    },
  },
  campaigns: {
    select: {
      id: true,
      name: true,
      merchantId: true,
    },
  },
} satisfies Prisma.LandingSelect;

export const landingLiteSelect = {
  id: true,
  name: true,
} satisfies Prisma.LandingSelect;
