// src/features/shortlinks/hooks/useShortlinkCrud.ts
"use client";

import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";
import type { Shortlink } from "@/types/domain";
import type { ShortlinkQueryParams } from "../model/shortlinkSchema";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<Shortlink>>(
    `${endpoints.shortlinks.base}?${buildQuery(params)}`,
    { cache: "no-store" }
  );

// Fetch by id (not code)
const get = (id: string) =>
  http.get<Shortlink>(endpoints.shortlinks.byId.replace(":id", encodeURIComponent(id)), {
    cache: "no-store",
  });

export const SHORTLINK_KEYS = {
  all: ["shortlinks"] as const,
  list: (filters: unknown) => ["shortlinks", "list", filters] as const,
  item: (id: string | undefined) => ["shortlinks", "item", id] as const,
};

const bridge = createCrudBridge<Shortlink, string>({
  keyBase: SHORTLINK_KEYS.all,
  list,
  get,
  create: (input: any) => http.post(endpoints.shortlinks.base, input),
  update: ({ id, ...input }: any) =>
    http.patch(endpoints.shortlinks.byId.replace(":id", id), input),
  remove: ({ id }: { id: string }) =>
    http.delete(endpoints.shortlinks.byId.replace(":id", id)),
  // Invalidate by id only
  getIdFromInput: (input) => input?.id,
  getIdFromResult: (result) => result?.id,
});

export const useShortlinksList = (params: ShortlinkQueryParams = {}) =>
  bridge.useList!(params);
export const useShortlinkItem = bridge.useItem!;
export const useCreateShortlink = bridge.useCreateMutation!;
export const useUpdateShortlink = bridge.useUpdateMutation!;
export const useDeleteShortlink = bridge.useRemoveMutation!;
