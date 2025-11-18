import {
  createThemeAction,
  updateThemeAction,
  deleteThemeAction,
  resetThemeAction,
} from "@/features/themes/server/actions";
import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import type { LiteListe } from "@/types/lists";
import type { ThemeQueryParams } from "../model/themeSchema";
import type { ThemeListItem } from "../server/queries";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<ThemeListItem>>(
    `/api/themes?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) => http.get<ThemeListItem>(`/api/themes/${id}`, { cache: "no-store" });

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`/api/themes/lite?${buildQuery(params)}`, {
    cache: "no-store",
  });

const bridge = createCrudBridge<ThemeListItem, string, LiteListe>({
  keyBase: ['themes'],
  list,
  get,
  liteList,
  actions: {
    create: createThemeAction,
    update: updateThemeAction,
    remove: deleteThemeAction,
  },
  getIdFromActionInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const useThemesList = (params: ThemeQueryParams = {}) => bridge.useList!(params);
export const useThemesLite = (
  params: Omit<ThemeQueryParams, "_lite"> = {},
  opts?: { enabled?: boolean }
) => bridge.useLite!(params, opts);
export const useThemeItem = (id?: string) => bridge.useItem!(id);
export const useCreateTheme = bridge.useCreateAction!;
export const useUpdateTheme = bridge.useUpdateAction!;
export const useDeleteTheme = bridge.useRemoveAction!;

export type ResetThemeInput = { id: string; merchantId: string; presetKey: string };
export const useResetTheme = (options?: {
  onSuccess?: (args: { data: { ok?: boolean }; input: ResetThemeInput }) => void;
  onError?: (args: { error: unknown; input: ResetThemeInput }) => void;
  extraInvalidateKeys?: QueryKey[];
}) => {
  const qc = useQueryClient();
  const { onSuccess, onError, extraInvalidateKeys, ...rest } = options ?? {};
  return useAction(resetThemeAction, {
    ...rest,
    onSuccess: (args) => {
      qc.invalidateQueries({ queryKey: ["themes", "list"] });
      qc.invalidateQueries({ queryKey: ["themes", "lite"] });
      extraInvalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      onSuccess?.({ data: args.data, input: args.input as ResetThemeInput });
    },
    onError: (args) => {
      onError?.({ error: args.error, input: args.input as ResetThemeInput });
    },
  });
};
