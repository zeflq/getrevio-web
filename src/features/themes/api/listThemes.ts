import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Theme } from '@/types/domain';
import { Paginated } from '@/types/api';
import { ThemeQueryParams } from '../model/themeSchema';


export type ThemeResponse = Paginated<Theme>;

export async function listThemes(params: ThemeQueryParams = {}): Promise<ThemeResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.merchantId) searchParams.set('merchantId', params.merchantId);
  if (params._page) searchParams.set('_page', params._page.toString());
  if (params._limit) searchParams.set('_limit', params._limit.toString());
  if (params._sort) searchParams.set('_sort', params._sort);
  if (params._order) searchParams.set('_order', params._order);

  const queryString = searchParams.toString();
  const endpoint = `${endpoints.themes.base}${queryString ? `?${queryString}` : ''}`;

  return await http.get<ThemeResponse>(endpoint);
}