import type { Prisma } from "@prisma/client";

import type { Shortlink } from "@/types/domain";

import { shortlinkLiteSelect, shortlinkSelect } from "./repo";

export type ShortlinkSelectRow = Prisma.ShortlinkGetPayload<{ select: typeof shortlinkSelect }>;
export type ShortlinkLiteRow = Prisma.ShortlinkGetPayload<{ select: typeof shortlinkLiteSelect }>;

export const mapShortlinkRow = (row: ShortlinkSelectRow): Shortlink => ({
  id: row.id,
  code: row.code,
  merchantId: row.merchantId,
  target: row.target as Shortlink["target"],
  channel: row.channel ?? undefined,
  themeId: row.themeId ?? undefined,
  active: row.active,
  expiresAt: row.expiresAt ?? undefined,
  utm: row.utm as Shortlink["utm"],
  createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : (row.createdAt as unknown as string),
  updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : (row.updatedAt as unknown as string),
});

export const mapShortlinkLite = (row: ShortlinkLiteRow) => ({
  value: row.id,
  label: row.code,
});
