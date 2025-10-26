import type { MerchantFilters } from "@/features/merchants/model/merchantSchema";
import type { MerchantListDTO } from "../../mappers";

export type MerchantQueryOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export interface MerchantQueryRepository {
  list(args: {
    filters: MerchantFilters;
    tenantId?: string;
    options?: MerchantQueryOptions;
  }): Promise<{ data: MerchantListDTO[]; total: number; totalPages: number }>;

  getById(args: {
    id: string;
    tenantId?: string;
    options?: MerchantQueryOptions;
  }): Promise<MerchantListDTO | null>;

  listLite(args: {
    filters: MerchantFilters;
    tenantId?: string;
    options?: MerchantQueryOptions;
  }): Promise<{ value: string; label: string }[]>;
}
