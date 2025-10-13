// src/features/shortlinks/hooks/useShortlinkCrud.ts
"use client";

import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";

import { type ShortlinkListItem } from "../server/queries";
import {
  createShortlinkAction,
  deleteShortlinkAction,
  updateShortlinkAction,
} from "../server/actions";
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
  http.get<ListEnvelope<ShortlinkListItem>>(
    `/api/shortlinks?${buildQuery(params)}`,
    { cache: "no-store" }
  );

// Fetch by id (not code)
const get = (id: string) =>
  http.get<ShortlinkListItem>(`/api/shortlinks/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

export const SHORTLINK_KEYS = {
  all: ["shortlinks"] as const,
  list: (filters: unknown) => ["shortlinks", "list", filters] as const,
  item: (id: string | undefined) => ["shortlinks", "item", id] as const,
};

const bridge = createCrudBridge<ShortlinkListItem, string>({
  keyBase: SHORTLINK_KEYS.all,
  list,
  get,
  actions: {
    create: createShortlinkAction,
    update: updateShortlinkAction,
    remove: deleteShortlinkAction,
  },
  // Invalidate by id only
  getIdFromActionInput: (input) => input?.id,
  getIdFromActionResult: (result) => result?.id,
});

export const useShortlinksList = (params: ShortlinkQueryParams = {}) =>
  bridge.useList!(params);
export const useShortlinkItem = bridge.useItem!;
export const useCreateShortlink = bridge.useCreateAction!;
export const useUpdateShortlink = bridge.useUpdateAction!;
export const useDeleteShortlink = bridge.useRemoveAction!;
