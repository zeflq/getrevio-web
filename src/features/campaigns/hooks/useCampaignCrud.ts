// src/features/campaigns/hooks/useCampaignCrud.ts
"use client";

import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";
import type { Campaign } from "@/types/domain";
import type { LiteListe } from "@/types/lists";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<Campaign>>(
    `${endpoints.campaigns.base}?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) =>
  http.get<Campaign>(
    endpoints.campaigns.byId.replace(':id', id),
    { cache: "no-store" }
  );

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(
    `${endpoints.campaigns.lite}?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const bridge = createCrudBridge<Campaign, string, LiteListe>({
  keyBase: ["campaigns"],
  list,
  get,
  liteList,
  // ✅ Flattened at root level (consistent with get/liteList)
  create: (input: any) => http.post(endpoints.campaigns.base, input),
  update: ({ id, ...input }: any) =>
    http.patch(endpoints.campaigns.byId.replace(':id', id), input),
  remove: ({ id }: { id: string }) =>
    http.delete(endpoints.campaigns.byId.replace(':id', id)),
  getIdFromInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const useCampaignsList = bridge.useList!;
export const useCampaignItem = bridge.useItem!;
export const useCampaignsLite = bridge.useLite!;

// ✅ New naming convention (Mutation instead of Action)
export const useCreateCampaign = bridge.useCreateMutation!;
export const useUpdateCampaign = bridge.useUpdateMutation!;
export const useDeleteCampaign = bridge.useRemoveMutation!;

export const CAMPAIGN_KEYS = {
  all: ["campaigns"] as const,
  list: (filters: unknown) => ["campaigns", "list", filters] as const,
  item: (id: string | undefined) => ["campaigns", "item", id] as const,
  lite: (filters: unknown) => ["campaigns", "lite", filters] as const,
};
