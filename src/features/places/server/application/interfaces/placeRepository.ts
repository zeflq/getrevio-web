import type { PlaceCreateInput, PlaceUpdateInput } from "@/features/places/model/placeSchema";

export type PlaceCreateRecord = {
  merchantId: string;
  localName: string;
  slug: string;
  address?: string | null;
  landingDefaults: PlaceCreateInput["landingDefaults"];
  googlePlaceId?: string | null;
};

export type PlaceUpdateRecord = {
  id: string;
  merchantId?: string;
  localName?: string;
  slug?: string;
  address?: string | null;
  landingDefaults?: PlaceUpdateInput["landingDefaults"];
  googlePlaceId?: string | null;
};

export interface PlaceRepository {
  create(data: PlaceCreateRecord): Promise<void>;
  update(data: PlaceUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
}
