import type { PlaceCreateInput } from "@/features/places/model/placeSchema";

export type CreatePlaceCommand = PlaceCreateInput & {
  tenantId?: string | null;
  userRole?: string | null;
};
