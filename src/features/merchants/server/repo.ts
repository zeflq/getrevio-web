import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { PrismaDefaultRepo } from "@/server/core/repos/prismaDefaultRepo";

export const merchantSelect = {
  id: true,
  name: true,
  email: true,
  plan: true,
  status: true,
  createdAt: true,
} satisfies Prisma.MerchantSelect;

export const merchantLiteSelect = {
  id: true,
  name: true,
} satisfies Prisma.MerchantSelect;

export const merchantRepo = new PrismaDefaultRepo<
  Prisma.MerchantGetPayload<{ select: typeof merchantSelect }>,
  Prisma.MerchantWhereInput,
  typeof merchantSelect,
  Prisma.MerchantCreateInput,
  Prisma.MerchantUpdateInput
>(prisma.merchant);
