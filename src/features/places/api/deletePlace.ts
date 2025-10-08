import { http } from '@/shared/lib/http';
import endpoints from '@/shared/api/endpoints.json';

export interface DeletePlaceResponse {
  success: true;
}

export async function deletePlace(id: string): Promise<DeletePlaceResponse> {
  const endpoint = endpoints.places.byId.replace(':id', id);
  await http.delete(endpoint);
  return { success: true };
}