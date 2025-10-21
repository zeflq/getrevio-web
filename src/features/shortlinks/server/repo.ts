import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { PrismaDefaultRepo } from "@/server/core/repos/prismaDefaultRepo";

export const shortlinkSelect = {
  id: true,
  code: true,
  merchantId: true,
  target: true,
  channel: true,
  themeId: true,
  active: true,
  expiresAt: true,
  utm: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ShortlinkSelect;

export const shortlinkLiteSelect = {
  id: true,
  code: true,
} satisfies Prisma.ShortlinkSelect;

export const shortlinkRepo = new PrismaDefaultRepo<
  Prisma.ShortlinkGetPayload<{ select: typeof shortlinkSelect }>,
  Prisma.ShortlinkWhereInput,
  typeof shortlinkSelect,
  Prisma.ShortlinkCreateInput,
  Prisma.ShortlinkUpdateInput
>(prisma.shortlink);
