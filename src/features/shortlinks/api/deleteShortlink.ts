import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';

export interface DeleteShortlinkResponse {
  success: true;
}

/** Remove a shortlink */
export async function deleteShortlink(code: string): Promise<DeleteShortlinkResponse> {
  const endpoint = endpoints.shortlinks.byId.replace(':id', code);
  await http.delete(endpoint);
  return { success: true };
}
