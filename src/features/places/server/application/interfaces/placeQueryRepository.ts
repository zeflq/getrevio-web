import { PlaceFilters } from "@/features/places/model/placeSchema";
import type { PlaceListDTO } from "../../mappers";

export type PlaceQueryOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export interface PlaceQueryRepository {
  list(args: {
    filters: PlaceFilters;
    tenantId?: string;
    options?: PlaceQueryOptions;
  }): Promise<{ data: PlaceListDTO[]; total: number; totalPages: number }>;

  getById(args: {
    id: string;
    tenantId?: string;
    options?: PlaceQueryOptions;
  }): Promise<PlaceListDTO | null>;

  existsWithSlug(args: {
    slug: string;
    tenantId?: string;
    options?: PlaceQueryOptions;
  }): Promise<boolean>;

  listLite(args: {
    filters: PlaceFilters;
    tenantId?: string;
    options?: PlaceQueryOptions;
  }): Promise<{ value: string; label: string }[]>;
}
