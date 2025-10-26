import { campaignQueryPolicy } from "../../policy";

import type { CampaignQueryOptions, CampaignQueryRepository } from "../interfaces/campaignQueryRepository";

export class GetCampaignUseCase {
  constructor(private readonly repository: CampaignQueryRepository) {}

  async execute(args: {
    id: string;
    tenantId?: string | null;
    options?: CampaignQueryOptions;
  }) {
    if (campaignQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.getById({
      id: args.id,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
