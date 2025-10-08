import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';

export type CheckPlaceSlugResponse = { exists: boolean };

export async function checkPlaceSlug(slug: string): Promise<CheckPlaceSlugResponse> {
  const searchParams = new URLSearchParams({ slug });
  const endpoint = `${endpoints.places.checkSlug}?${searchParams.toString()}`;
  return http.get<CheckPlaceSlugResponse>(endpoint);
}