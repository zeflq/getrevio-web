// features/merchants/hooks/useMerchantCrud.ts
"use client";

import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";
import type { LiteListe } from "@/types/lists";
import type { Merchant } from "@/types/domain";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  return search.toString();
};

// REST readers
const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<Merchant>>(
    `${endpoints.merchants.base}?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) =>{
  return  http.get<Merchant>(
    endpoints.merchants.byId.replace(':id', id),
    { cache: "no-store" }
  );
}

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`${endpoints.merchants.lite}?${buildQuery(params)}`, {
    cache: "no-store",
  });

// Build bridge
const bridge = createCrudBridge<Merchant, string, LiteListe>({
  keyBase: ["merchants"],
  list,
  get,
  liteList,
  create: (input: any) => http.post(endpoints.merchants.base, input),
  update: ({ id, ...input }: any) =>
    http.patch(endpoints.merchants.byId.replace(':id', id), input),
  remove: ({ id }: { id: string }) =>
    http.delete(endpoints.merchants.byId.replace(':id', id)),
  getIdFromInput: (i) => i?.id,
});

// 🔽 Expose ALL hooks with nice names
export const useMerchantsList = bridge.useList!;          // (params) -> { data, total, totalPages }
export const useMerchantItem = bridge.useItem!;           // (id) -> merchant
export const useMerchantsLite = bridge.useLite!;          // (params) -> { value, label }[]

export const useCreateMerchant = bridge.useCreateMutation!; // () -> { mutateAsync, isPending, ... }
export const useUpdateMerchant = bridge.useUpdateMutation!;
export const useDeleteMerchant = bridge.useRemoveMutation!;

// Optional: export keys if you want to reuse them elsewhere
export const MERCHANT_KEYS = {
  all: ["merchants"] as const,
  list: (f: unknown) => ["merchants", "list", f] as const,
  item: (id: string | undefined) => ["merchants", "item", id] as const,
  lite: (f: unknown) => ["merchants", "lite", f] as const,
};
