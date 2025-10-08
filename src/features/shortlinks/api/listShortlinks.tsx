import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import type { Paginated } from '@/types/api';
import type { Shortlink } from '@/types/domain';
import type { ShortlinkQueryParams } from '../model/shortlinkSchema';

const BASE = endpoints.shortlinks.base;

/** Fetch a paginated list of shortlinks */
export async function listShortlinks(params: ShortlinkQueryParams = {}): Promise<Paginated<Shortlink>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  const qs = searchParams.toString();
  return http.get<Paginated<Shortlink>>(`${BASE}${qs ? `?${qs}` : ''}`);
}

export type ListShortlinksParams = ShortlinkQueryParams;
