import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';

export interface SetDefaultThemeResponse {
  success: true;
}

// Nouveau endpoint qui prend themeId et merchantId
export async function setDefaultTheme({ themeId, merchantId }: { themeId: string; merchantId: string }): Promise<SetDefaultThemeResponse> {
  // Exemple d'endpoint : /merchants/:merchantId/themes/:themeId/default
  const endpoint = endpoints.themes.setDefaultForMerchant
    .replace(':merchantId', merchantId)
    .replace(':themeId', themeId);
  await http.post(endpoint, {});
  return { success: true };
}