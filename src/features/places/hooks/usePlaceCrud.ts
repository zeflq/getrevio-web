import { createCrudHooks } from "@/hooks/createCrudHooks"
import { Place } from "@/types/domain"
import { listPlaces, ListPlacesParams } from "../api/listPlaces"
import { getPlaceById } from "../api/getPlaceById"
import { createPlace } from "../api/createPlace"
import { updatePlace } from "../api/updatePlace"
import { deletePlace } from "../api/deletePlace"
import type { PlaceCreateInput, PlaceUpdateInput, PlaceLite } from "../model/placeSchema"

// Build CRUD hooks using the shared utility and places API
const crud = createCrudHooks<Place, string, PlaceLite>({
  keyBase: ["places"],
  list: (params) => listPlaces(params as ListPlacesParams),
  get: (id) => getPlaceById(id),
  create: (input) => createPlace(input as PlaceCreateInput),
  update: (id, input) => updatePlace(id, input as PlaceUpdateInput),
  remove: (id) => deletePlace(id),
  staleTimeMs: 60_000,
  lite: {
    map: (p) => ({ id: p.id, localName: p.localName }),
    paramKey: "_lite",
    defaultLimit: 20,
  },
})

// Export typed hook wrappers for convenient usage
export const usePlacesList = (params: ListPlacesParams = {}) => crud.useList!(params)
export const usePlacesLite = (
  params: Omit<ListPlacesParams, "_lite"> = {},
  opts?: { enabled?: boolean }
) => crud.useLite!(params, opts);
export const usePlaceItem = (id?: string) => crud.useItem!(id)
export const useCreatePlace = () => crud.useCreate!()
export const useUpdatePlace = () => crud.useUpdate!()
export const useDeletePlace = () => crud.useRemove!()