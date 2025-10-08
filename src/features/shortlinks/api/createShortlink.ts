import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import type { Shortlink } from '@/types/domain';
import type { ShortlinkCreateInput } from '../model/shortlinkSchema';

/** Create a new shortlink */
export async function createShortlink(input: ShortlinkCreateInput): Promise<Shortlink> {
  return http.post<Shortlink>(endpoints.shortlinks.base, input);
}
