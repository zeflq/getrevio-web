import { CampaignFilters } from "@/features/campaigns/model/campaignSchema";
import type { CampaignListDTO } from "../../mappers";
import type { LiteListe } from "@/types/lists";

export type CampaignLiteItem = LiteListe & {
  placeId?: string;
};

export type CampaignQueryOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export interface CampaignQueryRepository {
  list(args: {
    filters: CampaignFilters;
    tenantId?: string;
    options?: CampaignQueryOptions;
  }): Promise<{ data: CampaignListDTO[]; total: number; totalPages: number }>;

  getById(args: {
    id: string;
    tenantId?: string;
    options?: CampaignQueryOptions;
  }): Promise<CampaignListDTO | null>;

  listLite(args: {
    filters: CampaignFilters;
    tenantId?: string;
    options?: CampaignQueryOptions;
  }): Promise<CampaignLiteItem[]>;
}
