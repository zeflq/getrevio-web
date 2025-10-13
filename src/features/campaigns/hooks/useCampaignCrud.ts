// src/features/campaigns/hooks/useCampaignCrud.ts
"use client";

import {
  createCampaignAction,
  deleteCampaignAction,
  updateCampaignAction,
} from "@/features/campaigns/server/actions";
import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import type { LiteListe } from "@/types/lists";
import type { CampaignListItem } from "../server/queries";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<CampaignListItem>>(
    `/api/campaigns?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) =>
  http.get<CampaignListItem>(`/api/campaigns/${id}`, { cache: "no-store" });

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`/api/campaigns/lite?${buildQuery(params)}`, {
    cache: "no-store",
  });

const bridge = createCrudBridge<CampaignListItem, string, LiteListe>({
  keyBase: ["campaigns"],
  list,
  get,
  liteList,
  actions: {
    create: createCampaignAction,
    update: updateCampaignAction,
    remove: deleteCampaignAction,
  },
  getIdFromActionInput: (input) => input?.id,
});

export const useCampaignsList = bridge.useList!;
export const useCampaignItem = bridge.useItem!;
export const useCampaignsLite = bridge.useLite!;

export const useCreateCampaign = bridge.useCreateAction!;
export const useUpdateCampaign = bridge.useUpdateAction!;
export const useDeleteCampaign = bridge.useRemoveAction!;

export const CAMPAIGN_KEYS = {
  all: ["campaigns"] as const,
  list: (filters: unknown) => ["campaigns", "list", filters] as const,
  item: (id: string | undefined) => ["campaigns", "item", id] as const,
  lite: (filters: unknown) => ["campaigns", "lite", filters] as const,
};
