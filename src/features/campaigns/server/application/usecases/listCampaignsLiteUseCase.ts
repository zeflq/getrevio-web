import { campaignFiltersSchema } from "@/features/campaigns/model/campaignSchema";
import { campaignQueryPolicy } from "../../policy";

import type { CampaignQueryOptions, CampaignQueryRepository } from "../interfaces/campaignQueryRepository";

export class ListCampaignsLiteUseCase {
  constructor(private readonly repository: CampaignQueryRepository) {}

  async execute(args: {
    filters: unknown;
    tenantId?: string | null;
    options?: CampaignQueryOptions;
  }) {
    const parsed = campaignFiltersSchema.parse(args.filters);
    const filters = campaignQueryPolicy.validateAndClamp(parsed);

    if (campaignQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.listLite({
      filters,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
