import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Theme } from '@/types/domain';
import { ThemeUpdateInput } from '../model/themeSchema';

export async function updateTheme(id: string, data: ThemeUpdateInput): Promise<Theme> {
  const endpoint = endpoints.themes.byId.replace(':id', id);
  return http.patch<Theme>(endpoint, { ...data, updatedAt: new Date().toISOString() });
}