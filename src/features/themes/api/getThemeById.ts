import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Theme } from '@/types/domain';

export async function getThemeById(id: string): Promise<Theme> {
  const endpoint = endpoints.themes.byId.replace(':id', id);
  return http.get<Theme>(endpoint);
}