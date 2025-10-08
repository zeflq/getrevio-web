import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setDefaultTheme } from '../api/setDefaultTheme';

export function useSetDefaultTheme(merchantId: string) {
  const qc = useQueryClient();
  return useMutation<{ success: true }, Error, { themeId: string }>({
    mutationFn: async ({ themeId }) => setDefaultTheme({merchantId, themeId}),
    onSuccess: (_data, variables) => {
      // Invalidate list and specific item
      qc.invalidateQueries({ queryKey: ['merchants', 'item', merchantId] });
      qc.invalidateQueries({ queryKey: ['themes', 'list'] });
      qc.invalidateQueries({ queryKey: ['themes', 'item', variables.themeId] });
    },
  });
}