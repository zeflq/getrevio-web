"use client";

import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import type { LiteListe } from "@/types/lists";

import {
  createLotteryConfigAction,
  updateLotteryConfigAction,
  deleteLotteryConfigAction,
} from "@/features/lotteries/server/actions";
import type { LotteryConfigDetailDTO } from "@/features/lotteries/server/mappers";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<LotteryConfigDetailDTO>>(
    `/api/lotteries?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) =>
  http.get<LotteryConfigDetailDTO>(`/api/lotteries/${id}`, { cache: "no-store" });

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`/api/lotteries/lite?${buildQuery(params)}`, {
    cache: "no-store",
  });

const bridge = createCrudBridge<LotteryConfigDetailDTO, string, LiteListe>({
  keyBase: ["lotteries"],
  list,
  get,
  liteList,
  actions: {
    create: createLotteryConfigAction,
    update: updateLotteryConfigAction,
    remove: deleteLotteryConfigAction,
  },
  getIdFromActionInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const useLotteriesList = bridge.useList!;
export const useLotteryItem = bridge.useItem!;
export const useLotteriesLite = bridge.useLite!;
export const useCreateLottery = bridge.useCreateAction!;
export const useUpdateLottery = bridge.useUpdateAction!;
export const useDeleteLottery = bridge.useRemoveAction!;

export const LOTTERY_KEYS = {
  all: ["lotteries"] as const,
  list: (filters: unknown) => ["lotteries", "list", filters] as const,
  item: (id: string | undefined) => ["lotteries", "item", id] as const,
};
