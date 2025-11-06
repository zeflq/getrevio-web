import type { Prisma } from "@prisma/client";

import { placeLiteSelect, placeSelect } from "./infrastructure/prisma/placeSelects";

export type PlaceSelectRow = Prisma.PlaceGetPayload<{ select: typeof placeSelect }>;
export type PlaceLiteRow = Prisma.PlaceGetPayload<{ select: typeof placeLiteSelect }>;

export type PlaceListDTO = {
  id: string;
  merchantId: string;
  localName: string;
  slug: string;
  address?: string | null;
  themeId?: string | null;
  googlePlaceId?: string | null;
  createdAt: string;
  updatedAt: string;
};

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : String(value);
};

export const mapPlaceRow = (row: PlaceSelectRow): PlaceListDTO => ({
  id: row.id,
  merchantId: row.merchantId,
  localName: row.localName,
  slug: row.slug,
  address: row.address ?? null,
  themeId: row.themeId ?? null,
  googlePlaceId: row.googlePlaceId ?? null,
  createdAt: toIsoString(row.createdAt),
  updatedAt: toIsoString(row.updatedAt),
});

export const mapPlaceLite = (row: PlaceLiteRow) => ({
  value: row.id,
  label: row.localName ?? row.id,
});
