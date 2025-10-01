import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Merchant } from '@/types/domain';

export interface GetMerchantByIdParams {
  id: string;
}

export async function getMerchantById(params: GetMerchantByIdParams): Promise<Merchant> {
  const endpoint = endpoints.merchants.byId.replace(':id', params.id);
  return http.get<Merchant>(endpoint);
}