"use client";

import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";
import type { LiteListe } from "@/types/lists";
import type { LotteryConfig } from "@/types/domain";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  return search.toString();
};

// Transform form values (string booleans) to API values (actual booleans)
const transformLotteryInput = (input: any) => {
  return {
    ...input,
    enabled: input.enabled === "true" || input.enabled === true,
    guaranteeWinOnFirstPlay:
      input.guaranteeWinOnFirstPlay === "true" || input.guaranteeWinOnFirstPlay === true,
  };
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<LotteryConfig>>(
    `${endpoints.lotteries.base}?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) =>
  http.get<LotteryConfig>(endpoints.lotteries.byId.replace(":id", id), { cache: "no-store" });

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`${endpoints.lotteries.lite}?${buildQuery(params)}`, {
    cache: "no-store",
  });

const bridge = createCrudBridge<LotteryConfig, string, LiteListe>({
  keyBase: ["lotteries"],
  list,
  get,
  liteList,
  create: (input: any) => http.post(endpoints.lotteries.base, transformLotteryInput(input)),
  update: ({ id, ...input }: any) =>
    http.patch(endpoints.lotteries.byId.replace(":id", id), transformLotteryInput(input)),
  remove: ({ id }: { id: string }) =>
    http.delete(endpoints.lotteries.byId.replace(":id", id)),
  getIdFromInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const useLotteriesList = bridge.useList!;
export const useLotteryItem = bridge.useItem!;
export const useLotteriesLite = bridge.useLite!;
export const useCreateLottery = bridge.useCreateMutation!;
export const useUpdateLottery = bridge.useUpdateMutation!;
export const useDeleteLottery = bridge.useRemoveMutation!;

export const LOTTERY_KEYS = {
  all: ["lotteries"] as const,
  list: (filters: unknown) => ["lotteries", "list", filters] as const,
  item: (id: string | undefined) => ["lotteries", "item", id] as const,
};
