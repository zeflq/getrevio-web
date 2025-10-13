import { http } from '@/shared/lib/http';
export type CheckPlaceSlugResponse = { exists: boolean };

export async function checkPlaceSlug(slug: string): Promise<CheckPlaceSlugResponse> {
  const searchParams = new URLSearchParams({ slug });
  return http.get<CheckPlaceSlugResponse>(`/api/places/slug-check?${searchParams.toString()}`);
}
