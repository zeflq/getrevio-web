import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Theme } from '@/types/domain';
import { ThemeCreateInput } from '../model/themeSchema';

export async function createTheme(input: ThemeCreateInput): Promise<Theme> {
  const data = {
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return http.post<Theme>(endpoints.themes.base, data);
}