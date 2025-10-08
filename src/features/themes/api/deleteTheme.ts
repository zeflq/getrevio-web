import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';

export interface DeleteThemeResponse {
  success: true;
}

export async function deleteTheme(id: string): Promise<DeleteThemeResponse> {
  const endpoint = endpoints.themes.byId.replace(':id', id);
  await http.delete(endpoint);
  return { success: true };
}