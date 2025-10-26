import type { Prisma } from "@prisma/client";

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
