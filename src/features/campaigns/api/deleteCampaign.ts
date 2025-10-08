import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';

export interface DeleteCampaignResponse {
  success: true;
}

export async function deleteCampaign(id: string): Promise<DeleteCampaignResponse> {
  const endpoint = endpoints.campaigns.byId.replace(':id', id);
  await http.delete(endpoint);
  return { success: true };
}