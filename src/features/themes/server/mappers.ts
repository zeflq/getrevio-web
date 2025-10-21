import type { Prisma } from "@prisma/client";

import { themeLiteSelect, themeSelect } from "./repo";

export type ThemeSelectRow = Prisma.ThemeGetPayload<{ select: typeof themeSelect }>;
export type ThemeLiteRow = Prisma.ThemeGetPayload<{ select: typeof themeLiteSelect }>;

export type ThemeListDTO = {
  id: string;
  merchantId: string;
  name: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  accentColor?: string | null;
  textColor?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

const toIsoString = (value: Date | string) => (value instanceof Date ? value.toISOString() : String(value));

export const mapThemeRow = (row: ThemeSelectRow): ThemeListDTO => ({
  id: row.id,
  merchantId: row.merchantId,
  name: row.name,
  logoUrl: row.logoUrl ?? null,
  brandColor: row.brandColor ?? null,
  accentColor: row.accentColor ?? null,
  textColor: row.textColor ?? null,
  meta: (row.meta ?? null) as Record<string, unknown> | null,
  createdAt: toIsoString(row.createdAt),
  updatedAt: toIsoString(row.updatedAt),
});

export const mapThemeLite = (row: ThemeLiteRow) => ({
  value: row.id,
  label: row.name ?? row.id,
});
