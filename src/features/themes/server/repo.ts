import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { PrismaDefaultRepo } from "@/server/core/repos/prismaDefaultRepo";

export const themeSelect = {
  id: true,
  merchantId: true,
  name: true,
  logoUrl: true,
  brandColor: true,
  accentColor: true,
  textColor: true,
  meta: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ThemeSelect;

export const themeLiteSelect = {
  id: true,
  name: true,
} satisfies Prisma.ThemeSelect;

export const themeRepo = new PrismaDefaultRepo<
  Prisma.ThemeGetPayload<{ select: typeof themeSelect }>,
  Prisma.ThemeWhereInput,
  typeof themeSelect,
  Prisma.ThemeCreateInput,
  Prisma.ThemeUpdateInput
>(prisma.theme);
