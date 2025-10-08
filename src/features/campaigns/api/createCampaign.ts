import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Campaign } from '@/types/domain';
import { CampaignCreateInput } from '../model/campaignSchema';

export async function createCampaign(input: CampaignCreateInput): Promise<Campaign> {
  const data = {
    ...input,
    createdAt: new Date().toISOString(),
  };

  return http.post<Campaign>(endpoints.campaigns.base, data);
}