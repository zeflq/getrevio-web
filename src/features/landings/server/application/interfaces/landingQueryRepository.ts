import type { LandingFilters } from "@/features/landings/model/landingSchema";
import type { LandingListDTO } from "../../mappers";

export type LandingQueryOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export interface LandingQueryRepository {
  list(args: {
    filters: LandingFilters;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<{ data: LandingListDTO[]; total: number; totalPages: number }>;

  getById(args: {
    id: string;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<LandingListDTO | null>;

  listLite(args: {
    filters: LandingFilters;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<{ value: string; label: string }[]>;
}
