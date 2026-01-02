import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";
import type { LiteListe } from "@/types/lists";
import type { Theme, ThemePalette, ThemeTokens } from "@/types/domain";
import type { ThemeQueryParams } from "../model/themeSchema";
import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<Theme>>(
    `${endpoints.themes.base}?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) =>
  http.get<Theme>(endpoints.themes.byId.replace(":id", id), { cache: "no-store" });

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`${endpoints.themes.lite}?${buildQuery(params)}`, {
    cache: "no-store",
  });

const bridge = createCrudBridge<Theme, string, LiteListe>({
  keyBase: ["themes"],
  list,
  get,
  liteList,
  create: (input: any) => http.post(endpoints.themes.base, input),
  update: ({ id, ...input }: any) =>
    http.patch(endpoints.themes.byId.replace(":id", id), input),
  remove: ({ id }: { id: string }) =>
    http.delete(endpoints.themes.byId.replace(":id", id)),
  getIdFromInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const useThemesList = (params: ThemeQueryParams = {}) => bridge.useList!(params);
export const useThemesLite = (
  params: Omit<ThemeQueryParams, "_lite"> = {},
  opts?: { enabled?: boolean }
) => bridge.useLite!(params, opts);
export const useThemeItem = (id?: string) => bridge.useItem!(id);
export const useCreateTheme = bridge.useCreateMutation!;
export const useUpdateTheme = bridge.useUpdateMutation!;
export const useDeleteTheme = bridge.useRemoveMutation!;

export type ResetThemeInput = { id: string; merchantId: string; presetKey: string };
export const useResetTheme = (options?: {
  onSuccess?: (args: { data: { ok?: boolean }; input: ResetThemeInput }) => void;
  onError?: (args: { error: Error; input: ResetThemeInput }) => void;
  extraInvalidateKeys?: QueryKey[];
}) => {
  const qc = useQueryClient();
  const { onSuccess, onError, extraInvalidateKeys } = options ?? {};
  return useMutation({
    mutationFn: async (input: ResetThemeInput) => {
      // Try to get presets from cache first, otherwise fetch
      let presets = qc.getQueryData<ThemePreset[]>(["themes", "presets"]);

      if (!presets) {
        // Fetch presets from API if not in cache
        presets = await http.get<ThemePreset[]>(endpoints.themes.presets);
      }

      // Find the selected preset
      const selectedPreset = presets.find((p) => p.id === input.presetKey);

      if (!selectedPreset) {
        throw new Error(`Theme preset not found: ${input.presetKey}`);
      }

      // Build meta from API preset data
      const meta = {
        presetKey: selectedPreset.id,
        palette: selectedPreset.palette,
        tokens: selectedPreset.tokens,
      };

      return http.patch(endpoints.themes.byId.replace(":id", input.id), {
        merchantId: input.merchantId,
        meta,
      });
    },
    onSuccess: (data, input) => {
      qc.invalidateQueries({ queryKey: ["themes", "list"] });
      qc.invalidateQueries({ queryKey: ["themes", "lite"] });
      qc.invalidateQueries({ queryKey: ["themes", "item", input.id] });
      extraInvalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      onSuccess?.({ data: data as { ok?: boolean }, input });
    },
    onError: (error, input) => {
      onError?.({ error, input });
    },
  });
};

export type ThemePreset = {
  id: string;
  name: string;
  palette: ThemePalette;
  tokens: ThemeTokens;
};

/**
 * Fetch theme presets from API
 * Presets are static data, cached indefinitely
 */
export const useThemePresets = () => {
  return useQuery<ThemePreset[]>({
    queryKey: ["themes", "presets"],
    queryFn: () => http.get<ThemePreset[]>(endpoints.themes.presets),
    staleTime: Infinity, // Presets rarely change
  });
};
