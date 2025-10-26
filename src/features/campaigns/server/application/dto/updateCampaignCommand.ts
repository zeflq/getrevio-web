import type { CampaignUpdateInput } from "@/features/campaigns/model/campaignSchema";

export type UpdateCampaignCommand = CampaignUpdateInput & {
  id: string;
  tenantId?: string | null;
  userRole?: string | null;
};
