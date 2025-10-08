import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Merchant } from '@/types/domain';
import type { Paginated } from '@/types/api';
import { MerchantQueryParams } from '../model/merchantSchema';

export type MerchantResponse = Paginated<Merchant>;

export async function listMerchants(params: MerchantQueryParams = {}): Promise<MerchantResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.plan) searchParams.set('plan', params.plan);
  if (params.status) searchParams.set('status', params.status);
  if (params._page) searchParams.set('_page', params._page.toString());
  if (params._limit) searchParams.set('_limit', params._limit.toString());
  if (params._sort) searchParams.set('_sort', params._sort);
  if (params._order) searchParams.set('_order', params._order);
  if (params._lite) searchParams.set('_lite', params._lite.toString());

  const queryString = searchParams.toString();
  const endpoint = `${endpoints.merchants.base}${queryString ? `?${queryString}` : ''}`;

  return await http.get<MerchantResponse>(endpoint);
}