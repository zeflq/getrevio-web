import { useQuery } from "@tanstack/react-query";

import { http } from "@/shared/lib/http";

type CheckLandingSlugResponse = { exists: boolean };

async function checkLandingSlug(slug: string): Promise<CheckLandingSlugResponse> {
  const searchParams = new URLSearchParams({ slug });
  return http.get<CheckLandingSlugResponse>(`/api/landings/slug-check?${searchParams.toString()}`);
}

export function useLandingSlugCheck(slug: string | undefined) {
  return useQuery({
    queryKey: ["landings", "slug", slug],
    queryFn: async () => {
      if (!slug) return { exists: false };
      return checkLandingSlug(slug);
    },
    enabled: !!slug && slug.length > 0,
    staleTime: 60_000,
  });
}
