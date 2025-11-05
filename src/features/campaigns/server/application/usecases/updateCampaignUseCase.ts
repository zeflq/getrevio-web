import type { CampaignUpdateInput } from "@/features/campaigns/model/campaignSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { UpdateCampaignCommand } from "../dto/updateCampaignCommand";
import type { CampaignRepository, CampaignUpdateRecord } from "../interfaces/campaignRepository";

export class UpdateCampaignUseCase {
  constructor(private readonly repository: CampaignRepository) {}

  async execute(command: UpdateCampaignCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const { id, tenantId, userRole: _role, ...payload } = command;

    const normalized = this.normalizePayload(payload);

    const record: CampaignUpdateRecord = {
      id,
      ...normalized,
    };

    await this.repository.update(record, tenantId ?? null);
  }

  private normalizePayload(input: CampaignUpdateInput): CampaignUpdateInput {
    const normalized: CampaignUpdateInput = { ...input };

    if (normalized.name !== undefined && normalized.name !== null) {
      normalized.name = normalized.name.trim();
    }

    if (normalized.primaryCtaUrl !== undefined && normalized.primaryCtaUrl !== null) {
      normalized.primaryCtaUrl = normalized.primaryCtaUrl.trim();
    }

    if (normalized.themeId !== undefined) {
      if (typeof normalized.themeId === "string") {
        const trimmed = normalized.themeId.trim();
        normalized.themeId = trimmed.length > 0 ? trimmed : null;
      }
    }

    return normalized;
  }

  private ensureTenantAccess(command: UpdateCampaignCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId && command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
