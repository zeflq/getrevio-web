import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';

export interface DeleteMerchantResponse {
  success: true;
}

export async function deleteMerchant(id: string): Promise<DeleteMerchantResponse> {
  const endpoint = endpoints.merchants.byId.replace(':id', id);
  await http.delete(endpoint);
  return { success: true };
}