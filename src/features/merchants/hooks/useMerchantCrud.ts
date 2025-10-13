// features/merchants/hooks/useMerchantCrud.ts
"use client";

import {
  createMerchantAction,
  updateMerchantAction,
  deleteMerchantAction,
} from "@/features/merchants/server/actions";
import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import type { LiteListe } from "@/types/lists";

type MerchantListItem = {
  id: string;
  name: string;
  email: string;
  defaultThemeId?: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "suspended";
  createdAt: string;
};

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
  http.get<ListEnvelope<MerchantListItem>>(
    `/api/merchants?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) =>{
  return  http.get<MerchantListItem>(`/api/merchants/${id}`, { cache: "no-store" });
}

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`/api/merchants/lite?${buildQuery(params)}`, {
    cache: "no-store",
  });

// Build bridge
const bridge = createCrudBridge<MerchantListItem, string, LiteListe>({
  keyBase: ["merchants"],
  list,
  get,
  liteList,
  actions: {
    create: createMerchantAction,
    update: updateMerchantAction,
    remove: deleteMerchantAction,
  },
  getIdFromActionInput: (i) => i?.id,
});

// 🔽 Expose ALL hooks with nice names
export const useMerchantsList = bridge.useList!;          // (params) -> { data, total, totalPages }
export const useMerchantItem = bridge.useItem!;           // (id) -> merchant
export const useMerchantsLite = bridge.useLite!;          // (params) -> { value, label }[]

export const useCreateMerchant = bridge.useCreateAction!; // () -> { execute, isExecuting, result, ... }
export const useUpdateMerchant = bridge.useUpdateAction!;
export const useDeleteMerchant = bridge.useRemoveAction!;

// Optional: export keys if you want to reuse them elsewhere
export const MERCHANT_KEYS = {
  all: ["merchants"] as const,
  list: (f: unknown) => ["merchants", "list", f] as const,
  item: (id: string | undefined) => ["merchants", "item", id] as const,
  lite: (f: unknown) => ["merchants", "lite", f] as const,
};
