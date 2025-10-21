import type { Prisma } from "@prisma/client";

import { merchantLiteSelect, merchantSelect } from "./repo";

export type MerchantSelectRow = Prisma.MerchantGetPayload<{ select: typeof merchantSelect }>;
export type MerchantLiteRow = Prisma.MerchantGetPayload<{ select: typeof merchantLiteSelect }>;

export type MerchantListDTO = {
  id: string;
  name: string;
  email?: string | null;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "suspended";
  createdAt: string;
};

const toIso = (value: Date | string) => (value instanceof Date ? value.toISOString() : String(value));

export const mapMerchantRow = (row: MerchantSelectRow): MerchantListDTO => ({
  id: row.id,
  name: row.name,
  email: row.email ?? null,
  plan: row.plan,
  status: row.status,
  createdAt: toIso(row.createdAt),
});

export const mapMerchantLite = (row: MerchantLiteRow) => ({
  value: row.id,
  label: row.name ?? row.id,
});
