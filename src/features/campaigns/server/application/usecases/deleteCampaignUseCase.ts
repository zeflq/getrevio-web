import { SUPER_ADMIN } from "@/lib/utils";

import type { DeleteCampaignCommand } from "../dto/deleteCampaignCommand";
import type { CampaignRepository } from "../interfaces/campaignRepository";

export class DeleteCampaignUseCase {
  constructor(private readonly repository: CampaignRepository) {}

  async execute(command: DeleteCampaignCommand): Promise<void> {
    this.ensureTenantAccess(command);
    await this.repository.delete(command.id, command.tenantId ?? null);
  }

  private ensureTenantAccess(command: DeleteCampaignCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    // Tenant scoped delete already enforced at repository level using tenantId
  }
}
