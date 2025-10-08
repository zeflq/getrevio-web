import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Merchant } from '@/types/domain';

export async function getMerchantById(id: string): Promise<Merchant> {
  const endpoint = endpoints.merchants.byId.replace(':id', id);
  return http.get<Merchant>(endpoint);
}