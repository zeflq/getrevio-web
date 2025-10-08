import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Place } from '@/types/domain';

export async function getPlaceById(id: string): Promise<Place> {
  const endpoint = endpoints.places.byId.replace(':id', id);
  return http.get<Place>(endpoint);
}