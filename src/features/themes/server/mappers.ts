import type { Prisma } from "@prisma/client";

import { themeLiteSelect, themeSelect } from "./infrastructure/prisma/themeSelects";
import type { ThemeMeta } from "@/types/domain";

export type ThemeSelectRow = Prisma.ThemeGetPayload<{ select: typeof themeSelect }>;
export type ThemeLiteRow = Prisma.ThemeGetPayload<{ select: typeof themeLiteSelect }>;

export type ThemeListDTO = {
  id: string;
  merchantId: string;
  name: string;
  meta?: ThemeMeta | null;
  createdAt: string;
  updatedAt: string;
};

const toIsoString = (value: Date | string) => (value instanceof Date ? value.toISOString() : String(value));

export const mapThemeRow = (row: ThemeSelectRow): ThemeListDTO => ({
  id: row.id,
  merchantId: row.merchantId,
  name: row.name,
  meta: (row.meta ?? null) as ThemeMeta | null,
  createdAt: toIsoString(row.createdAt),
  updatedAt: toIsoString(row.updatedAt),
});

export const mapThemeLite = (row: ThemeLiteRow) => ({
  value: row.id,
  label: row.name ?? row.id,
});
