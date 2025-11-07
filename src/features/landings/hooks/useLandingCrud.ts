import {
  createLandingAction,
  updateLandingAction,
  deleteLandingAction,
} from "@/features/landings/server/actions";
import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import type { LiteListe } from "@/types/lists";
import type { LandingListItem } from "../server/mappers";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<LandingListItem>>(`/api/landings?${buildQuery(params)}`, {
    cache: "no-store",
  });

const get = (id: string) =>
  http.get<LandingListItem>(`/api/landings/${id}`, { cache: "no-store" });

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`/api/landings/lite?${buildQuery(params)}`, {
    cache: "no-store",
  });

const bridge = createCrudBridge<LandingListItem>({
  keyBase: ["landings"],
  list,
  get,
  liteList,
  actions: {
    create: createLandingAction,
    update: updateLandingAction,
    remove: deleteLandingAction,
  },
  getIdFromActionInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const useLandingsList = bridge.useList!;
export const useLandingItem = bridge.useItem!;
export const useLandingsLite = bridge.useLite!;
export const useCreateLanding = bridge.useCreateAction!;
export const useUpdateLanding = bridge.useUpdateAction!;
export const useDeleteLanding = bridge.useRemoveAction!;
