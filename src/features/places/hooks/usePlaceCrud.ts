import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";
import type { LiteListe } from "@/types/lists";
import type { Place } from "@/types/domain";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  return search.toString();
};

// READ operations
const list = (params: Record<string, unknown>) =>
  http.get<ListEnvelope<Place>>(
    `${endpoints.places.base}?${buildQuery(params)}`,
    { cache: "no-store" }
  );

const get = (id: string) =>
  http.get<Place>(
    endpoints.places.byId.replace(':id', id),
    { cache: "no-store" }
  );

const liteList = (params: Record<string, unknown>) =>
  http.get<LiteListe[]>(
    `${endpoints.places.lite}?${buildQuery(params)}`,
    { cache: "no-store" }
  );

// WRITE operations
const bridge = createCrudBridge<Place, string, LiteListe>({
  keyBase: ["places"],
  list,
  get,
  liteList,
  create: (input: any) => http.post(endpoints.places.base, input),
  update: ({ id, ...input }: any) => http.patch(endpoints.places.byId.replace(':id', id), input),
  remove: ({ id }: { id: string }) => http.delete(endpoints.places.byId.replace(':id', id)),
  getIdFromInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const usePlacesList = bridge.useList!;
export const usePlaceItem = bridge.useItem!;
export const usePlacesLite = bridge.useLite!;
export const useCreatePlace = bridge.useCreateMutation!;
export const useUpdatePlace = bridge.useUpdateMutation!;
export const useDeletePlace = bridge.useRemoveMutation!;
