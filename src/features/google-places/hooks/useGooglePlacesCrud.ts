"use client";

import { http } from "@/shared/lib/http";
import { createCrudBridge, type ListEnvelope } from "@/hooks/createCrudBridge";
import endpoints from "@/shared/api/endpoints.json";
import type { GooglePlaceRow } from "../types";

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  return search.toString();
};

const list = (params: Record<string, unknown>) => {
  const query = buildQuery(params);
  const url = `/api/google-places${query ? `?${query}` : ""}`;
  return http.get<ListEnvelope<GooglePlaceRow>>(url, { cache: "no-store" });
};

const bridge = createCrudBridge<GooglePlaceRow, string>({
  keyBase: ["googlePlaces"],
  list,
  create: (input: any) => http.post(endpoints.places.base, input),
  update: ({ id, ...input }: any) => http.patch(endpoints.places.byId.replace(':id', id), input),
  getIdFromInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const useGooglePlacesList = bridge.useList!;
export const useCreateFromGooglePlace = bridge.useCreateMutation!;
export const useLinkGooglePlace = bridge.useUpdateMutation!;

export const GOOGLE_PLACES_KEYS = {
  list: (filters: unknown) => ["googlePlaces", "list", filters] as const,
};
