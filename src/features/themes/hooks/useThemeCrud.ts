import {
  createThemeAction,
  updateThemeAction,
  deleteThemeAction,
} from "@/features/themes/server/actions";
import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import type { LiteListe } from "@/types/lists";
import type { ThemeQueryParams } from "../model/themeSchema";
import type { ThemeListItem } from "../server/queries";

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
