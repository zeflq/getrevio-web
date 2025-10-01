import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Merchant } from '@/types/domain';
import { MerchantUpdateInput } from '../model/merchantSchema';

export interface UpdateMerchantParams {
  id: string;
  data: MerchantUpdateInput;
}

export async function updateMerchant(params: UpdateMerchantParams): Promise<Merchant> {
  const endpoint = endpoints.merchants.byId.replace(':id', params.id);
  return http.patch<Merchant>(endpoint, params.data);
}