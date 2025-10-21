import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { PrismaDefaultRepo } from "@/server/core/repos/prismaDefaultRepo";

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

export const placeRepo = new PrismaDefaultRepo<
  Prisma.PlaceGetPayload<{ select: typeof placeSelect }>,
  Prisma.PlaceWhereInput,
  typeof placeSelect,
  Prisma.PlaceCreateInput,
  Prisma.PlaceUpdateInput
>(prisma.place);
