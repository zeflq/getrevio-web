import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMerchant } from '../api/createMerchant';
import { MerchantCreateInput } from '../model/merchantSchema';
import { Merchant } from '@/types/domain';

export function useCreateMerchant() {
  const queryClient = useQueryClient();

  return useMutation<Merchant, Error, MerchantCreateInput>({
    mutationFn: createMerchant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      console.log('Merchant created successfully');
    },
  });
}