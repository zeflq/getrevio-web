import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Campaign } from '@/types/domain';

export interface ListCampaignsParams {
  q?: string;
  status?: 'draft' | 'active' | 'archived';
  merchantId?: string;
  placeId?: string;
  _page?: number;
  _limit?: number;
  _sort?: 'name' | 'createdAt' | 'status';
  _order?: 'asc' | 'desc';
}

export interface CampaignResponse {
  data: Campaign[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listCampaigns(params: ListCampaignsParams = {}): Promise<CampaignResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.status) searchParams.set('status', params.status);
  if (params.merchantId) searchParams.set('merchantId', params.merchantId);
  if (params.placeId) searchParams.set('placeId', params.placeId);
  if (params._page) searchParams.set('_page', params._page.toString());
  if (params._limit) searchParams.set('_limit', params._limit.toString());
  if (params._sort) searchParams.set('_sort', params._sort);
  if (params._order) searchParams.set('_order', params._order);

  const queryString = searchParams.toString();
  const endpoint = `${endpoints.campaigns.base}${queryString ? `?${queryString}` : ''}`;

  return await http.get<CampaignResponse>(endpoint);
}