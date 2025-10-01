import { useQuery } from '@tanstack/react-query';
import { listMerchants, ListMerchantsParams, MerchantResponse } from '../api/listMerchants';

export function useMerchants(params: ListMerchantsParams = {}) {
  return useQuery<MerchantResponse, Error>({
    queryKey: ['merchants', params],
    queryFn: () => listMerchants(params),
    staleTime: 60_000,
    retry: false,
  });
}