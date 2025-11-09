import type { LandingFilters } from "@/features/landings/model/landingSchema";
import type { LandingListDTO } from "../../mappers";
import type { MerchantListDTO } from "@/features/merchants/server/mappers";

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

  existsWithSlug(args: {
    slug: string;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<boolean>;

  listLite(args: {
    filters: LandingFilters;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<{ value: string; label: string }[]>;

  getLandingWithMerchant(args: {
    id: string;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<{ landing: LandingListDTO | null; merchant: MerchantListDTO | null } | null>;
}
