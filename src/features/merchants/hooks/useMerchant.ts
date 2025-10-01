import { useQuery } from '@tanstack/react-query';
import { getMerchantById } from '../api/getMerchantById';

export interface UseMerchantParams {
  id: string | undefined;
}

export function useMerchant(params: UseMerchantParams) {
  return useQuery({
    queryKey: ['merchant', params.id],
    queryFn: () => getMerchantById({ id: params.id! }),
    enabled: !!params.id,
    staleTime: 60_000,
    retry: false,
  });
}