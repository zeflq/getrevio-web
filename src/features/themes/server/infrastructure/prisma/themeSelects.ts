import type { Prisma } from "@prisma/client";

export const themeSelect = {
  id: true,
  merchantId: true,
  name: true,
  meta: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ThemeSelect;

export const themeLiteSelect = {
  id: true,
  name: true,
} satisfies Prisma.ThemeSelect;
