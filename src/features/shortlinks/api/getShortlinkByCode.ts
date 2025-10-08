import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import type { Shortlink } from '@/types/domain';

/** Fetch a single shortlink by its code */
export async function getShortlinkByCode(code: string): Promise<Shortlink> {
  const endpoint = endpoints.shortlinks.byId.replace(':id', code);
  return http.get<Shortlink>(endpoint);
}
