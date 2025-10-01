import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMerchant, DeleteMerchantParams, DeleteMerchantResponse } from '../api/deleteMerchant';

export function useDeleteMerchant() {
  const queryClient = useQueryClient();

  return useMutation<DeleteMerchantResponse, Error, DeleteMerchantParams>({
    mutationFn: deleteMerchant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      console.log('Merchant deleted successfully');
    },
  });
}