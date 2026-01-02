import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";
import type { LiteListe } from "@/types/lists";
import type { Landing } from "@/types/domain";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<Landing>>(`${endpoints.landings.base}?${buildQuery(params)}`, {
    cache: "no-store",
  });

const get = (id: string) =>
  http.get<Landing>(endpoints.landings.byId.replace(":id", id), { cache: "no-store" });

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`${endpoints.landings.lite}?${buildQuery(params)}`, {
    cache: "no-store",
  });

const bridge = createCrudBridge<Landing, string, LiteListe>({
  keyBase: ["landings"],
  list,
  get,
  liteList,
  create: (input: any) => http.post(endpoints.landings.base, input),
  update: ({ id, ...input }: any) =>
    http.patch(endpoints.landings.byId.replace(":id", id), input),
  remove: ({ id }: { id: string }) =>
    http.delete(endpoints.landings.byId.replace(":id", id)),
  getIdFromInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const useLandingsList = bridge.useList!;
export const useLandingItem = bridge.useItem!;
export const useLandingsLite = bridge.useLite!;
export const useCreateLanding = bridge.useCreateMutation!;
export const useUpdateLanding = bridge.useUpdateMutation!;
export const useDeleteLanding = bridge.useRemoveMutation!;
