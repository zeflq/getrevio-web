import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';
import { Place } from '@/types/domain';
import { PlaceCreateInput } from '../model/placeSchema';

export async function createPlace(input: PlaceCreateInput): Promise<Place> {
  const data = {
    ...input,
    createdAt: new Date().toISOString(),
  };

  return http.post<Place>(endpoints.places.base, data);
}