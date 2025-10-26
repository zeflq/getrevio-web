import type { PlaceUpdateInput } from "@/features/places/model/placeSchema";

export type UpdatePlaceCommand = PlaceUpdateInput & {
  id: string;
  tenantId?: string | null;
  userRole?: string | null;
};
