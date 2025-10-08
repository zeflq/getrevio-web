import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Merchant } from '@/types/domain';
import { MerchantUpdateInput } from '../model/merchantSchema';


export async function updateMerchant(id:string , data: MerchantUpdateInput): Promise<Merchant> {
  const endpoint = endpoints.merchants.byId.replace(':id', id);
  return http.patch<Merchant>(endpoint, data);
}