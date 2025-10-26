import type { Prisma } from "@prisma/client";

export const placeSelect = {
  id: true,
  merchantId: true,
  localName: true,
  slug: true,
  address: true,
  themeId: true,
  landingDefaults: true,
  googlePlaceId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PlaceSelect;

export const placeLiteSelect = {
  id: true,
  localName: true,
} satisfies Prisma.PlaceSelect;
