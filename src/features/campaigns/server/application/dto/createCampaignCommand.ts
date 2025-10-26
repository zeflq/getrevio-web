import type { CampaignCreateInput } from "@/features/campaigns/model/campaignSchema";

export type CreateCampaignCommand = CampaignCreateInput & {
  tenantId?: string | null;
  userRole?: string | null;
};
