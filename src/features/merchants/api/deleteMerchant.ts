import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';

export interface DeleteMerchantParams {
  id: string;
}

export interface DeleteMerchantResponse {
  success: true;
}

export async function deleteMerchant(params: DeleteMerchantParams): Promise<DeleteMerchantResponse> {
  const endpoint = endpoints.merchants.byId.replace(':id', params.id);
  await http.delete(endpoint);
  return { success: true };
}