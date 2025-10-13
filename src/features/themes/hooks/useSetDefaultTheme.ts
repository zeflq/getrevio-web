import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { setDefaultThemeAction } from '@/features/themes/server/actions';

export function useSetDefaultTheme(merchantId: string) {
  const qc = useQueryClient();
  return useAction(setDefaultThemeAction, {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['merchants', 'item', merchantId] });
      qc.invalidateQueries({ queryKey: ['themes', 'list'] });
      qc.invalidateQueries({ queryKey: ['themes', 'lite'] });
    },
  });
}
