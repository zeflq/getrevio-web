import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import type { Shortlink } from '@/types/domain';
import type { ShortlinkUpdateInput } from '../model/shortlinkSchema';

/** Update an existing shortlink */
export async function updateShortlink(code: string, input: ShortlinkUpdateInput): Promise<Shortlink> {
  const endpoint = endpoints.shortlinks.byId.replace(':id', code);
  return http.patch<Shortlink>(endpoint, input);
}
