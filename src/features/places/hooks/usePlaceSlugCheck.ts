import { useQuery } from '@tanstack/react-query';
import { checkPlaceSlug } from '../api/checkPlaceSlug';

export function usePlaceSlugCheck(slug: string | undefined) {
  return useQuery({
    queryKey: ['places', 'slug', slug],
    queryFn: async () => {
      if (!slug) return { exists: false };
      return checkPlaceSlug(slug);
    },
    enabled: !!slug && slug.length > 0,
    staleTime: 60_000,
  });
}