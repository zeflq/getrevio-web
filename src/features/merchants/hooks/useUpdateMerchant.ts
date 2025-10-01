import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMerchant, UpdateMerchantParams } from '../api/updateMerchant';
import { Merchant } from '@/types/domain';

export interface UseUpdateMerchantParams {
  id: string;
}

export function useUpdateMerchant(params: UseUpdateMerchantParams) {
  const queryClient = useQueryClient();

  return useMutation<Merchant, Error, UpdateMerchantParams>({
    mutationFn: updateMerchant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', params.id] });
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      console.log('Merchant updated successfully');
    },
  });
}