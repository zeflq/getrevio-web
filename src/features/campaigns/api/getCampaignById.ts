import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Campaign } from '@/types/domain';

export async function getCampaignById(id: string): Promise<Campaign> {
  const endpoint = endpoints.campaigns.byId.replace(':id', id);
  return http.get<Campaign>(endpoint);
}