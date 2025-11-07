import type { CampaignCreateInput } from "@/features/campaigns/model/campaignSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { CreateCampaignCommand } from "../dto/createCampaignCommand";
import type { CampaignCreateRecord, CampaignRepository } from "../interfaces/campaignRepository";

export class CreateCampaignUseCase {
  constructor(private readonly repository: CampaignRepository) {}

  async execute(command: CreateCampaignCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const { tenantId: _tenantId, userRole: _userRole, ...campaign } = command;

    const data: CampaignCreateInput = {
      ...campaign,
      name: campaign.name.trim(),
    };
    const payload: CampaignCreateRecord = {
      merchantId: data.merchantId,
      placeId: data.placeId,
      name: data.name,
      status: data.status,
    };

    await this.repository.create(payload);
  }

  private ensureTenantAccess(command: CreateCampaignCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
