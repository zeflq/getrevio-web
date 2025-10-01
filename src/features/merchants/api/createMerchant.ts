import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Merchant } from '@/types/domain';
import { MerchantCreateInput } from '../model/merchantSchema';

export async function createMerchant(input: MerchantCreateInput): Promise<Merchant> {
  const data = {
    ...input,
    createdAt: new Date().toISOString(),
  };

  return http.post<Merchant>(endpoints.merchants.base, data);
}