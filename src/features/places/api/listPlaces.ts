import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Place } from '@/types/domain';
import type { Paginated } from '@/types/api';

export interface ListPlacesParams {
  q?: string;
  merchantId?: string;
  slug?: string;
  _page?: number;
  _limit?: number;
  _sort?: 'localName' | 'createdAt';
  _order?: 'asc' | 'desc';
  _lite?: boolean;
}

export type PlaceResponse = Paginated<Place>;

export async function listPlaces(params: ListPlacesParams = {}): Promise<PlaceResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.merchantId) searchParams.set('merchantId', params.merchantId);
  if (params.slug) searchParams.set('slug', params.slug);
  if (params._page) searchParams.set('_page', params._page.toString());
  if (params._limit) searchParams.set('_limit', params._limit.toString());
  if (params._sort) searchParams.set('_sort', params._sort);
  if (params._order) searchParams.set('_order', params._order);
  if (params._lite) searchParams.set('_lite', params._lite.toString());

  const queryString = searchParams.toString();
  const endpoint = `${endpoints.places.base}${queryString ? `?${queryString}` : ''}`;

  return await http.get<PlaceResponse>(endpoint);
}