import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Place } from '@/types/domain';
import { PlaceUpdateInput } from '../model/placeSchema';

export async function updatePlace(id: string, data: PlaceUpdateInput): Promise<Place> {
  const endpoint = endpoints.places.byId.replace(':id', id);
  return http.patch<Place>(endpoint, data);
}