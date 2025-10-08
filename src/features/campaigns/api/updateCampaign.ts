import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Campaign } from '@/types/domain';
import { CampaignUpdateInput } from '../model/campaignSchema';

export async function updateCampaign(id: string, data: CampaignUpdateInput): Promise<Campaign> {
  const endpoint = endpoints.campaigns.byId.replace(':id', id);
  return http.patch<Campaign>(endpoint, data);
}