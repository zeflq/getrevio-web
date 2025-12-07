import type { Prisma } from "@/generated/client";

export const merchantSelect = {
  id: true,
  name: true,
  email: true,
  locale: true,
  plan: true,
  status: true,
  createdAt: true,
  slug: true,
} satisfies Prisma.MerchantSelect;

export const merchantLiteSelect = {
  id: true,
  name: true,
} satisfies Prisma.MerchantSelect;
