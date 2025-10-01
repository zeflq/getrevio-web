import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';

export interface MerchantQuickStats {
  places: number;
  campaigns: number;
  shortlinks: number;
}

export interface GetMerchantQuickStatsParams {
  id: string;
}

export async function getMerchantQuickStats(
  params: GetMerchantQuickStatsParams
): Promise<MerchantQuickStats> {
  const endpoint = endpoints.merchants.stats.replace(':id', params.id);
  return http.get<MerchantQuickStats>(endpoint);
}