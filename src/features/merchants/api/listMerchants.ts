import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Merchant } from '@/types/domain';
export interface ListMerchantsParams {
  q?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  status?: 'active' | 'suspended';
  _page?: number;
  _limit?: number;
  _sort?: 'name' | 'createdAt' | 'plan' | 'status';
  _order?: 'asc' | 'desc';
}

export interface MerchantResponse {
  data: Merchant[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listMerchants(params: ListMerchantsParams = {}): Promise<MerchantResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.plan) searchParams.set('plan', params.plan);
  if (params.status) searchParams.set('status', params.status);
  if (params._page) searchParams.set('_page', params._page.toString());
  if (params._limit) searchParams.set('_limit', params._limit.toString());
  if (params._sort) searchParams.set('_sort', params._sort);
  if (params._order) searchParams.set('_order', params._order);

  const queryString = searchParams.toString();
  const endpoint = `${endpoints.merchants.base}${queryString ? `?${queryString}` : ''}`;

  return await http.get<MerchantResponse>(endpoint);
}