import type { Prisma } from "@prisma/client";

import { ensureLandingContentShape, type LandingContent } from "../model/landingSchema";
import { landingSelect, landingLiteSelect } from "./infrastructure/prisma/landingSelects";

export type LandingSelectRow = Prisma.LandingGetPayload<{ select: typeof landingSelect }>;
export type LandingLiteRow = Prisma.LandingGetPayload<{ select: typeof landingLiteSelect }>;

export type LandingListDTO = {
  id: string;
  merchantId: string;
  name: string;
  status: "draft" | "published" | "archived";
  content: LandingContent;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
};

export const mapLandingRow = (row: LandingSelectRow): LandingListDTO => ({
  id: row.id,
  merchantId: row.merchantId,
  name: row.name,
  status: row.status,
  content: ensureLandingContentShape(row.content as LandingContent | null | undefined),
  publishedAt: toIsoString(row.publishedAt),
  createdAt: toIsoString(row.createdAt) ?? "",
  updatedAt: toIsoString(row.updatedAt) ?? "",
});

export const mapLandingLite = (row: LandingLiteRow) => ({
  value: row.id,
  label: row.name ?? row.id,
});

export type { LandingListDTO as LandingListItem };
