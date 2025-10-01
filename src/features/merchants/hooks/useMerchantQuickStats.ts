import { useQuery } from '@tanstack/react-query';
import { getMerchantQuickStats, MerchantQuickStats } from '../api/getMerchantQuickStats';

export interface UseMerchantQuickStatsParams {
  id: string | undefined;
}

export function useMerchantQuickStats(params: UseMerchantQuickStatsParams) {
  return useQuery<MerchantQuickStats, Error>({
    queryKey: ['merchantQuickStats', params.id],
    queryFn: () => getMerchantQuickStats({ id: params.id! }),
    enabled: !!params.id,
    staleTime: 30_000,
    retry: false,
  });
}