import {
  createPlaceAction,
  updatePlaceAction,
  deletePlaceAction,
} from "@/features/places/server/actions";
import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import type { LiteListe } from "@/types/lists";
import type { PlaceListItem } from "../server/queries";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<PlaceListItem>>(
    `/api/places?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) => http.get<PlaceListItem>(`/api/places/${id}`, { cache: "no-store" });

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(`/api/places/lite?${buildQuery(params)}`, {
    cache: "no-store",
  });

const bridge = createCrudBridge<PlaceListItem, string, LiteListe>({
  keyBase: ["places"],
  list,
  get,
  liteList,
  actions: {
    create: createPlaceAction,
    update: updatePlaceAction,
    remove: deletePlaceAction,
  },
  getIdFromActionInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const usePlacesList = bridge.useList!;
export const usePlaceItem = bridge.useItem!;
export const usePlacesLite = bridge.useLite!;
export const useCreatePlace = bridge.useCreateAction!;
export const useUpdatePlace = bridge.useUpdateAction!;
export const useDeletePlace = bridge.useRemoveAction!;
