import type { Prisma } from "@prisma/client";

export const merchantSelect = {
  id: true,
  name: true,
  email: true,
  locale: true,
  defaultThemeId: true,
  plan: true,
  status: true,
  createdAt: true,
} satisfies Prisma.MerchantSelect;

export const merchantLiteSelect = {
  id: true,
  name: true,
} satisfies Prisma.MerchantSelect;
