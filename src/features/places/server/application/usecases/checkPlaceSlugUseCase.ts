import { placeQueryPolicy } from "../../policy";

import type { PlaceQueryOptions, PlaceQueryRepository } from "../interfaces/placeQueryRepository";

type Command = {
  slug: string;
  tenantId?: string | null;
  options?: PlaceQueryOptions;
};

export class CheckPlaceSlugUseCase {
  constructor(private readonly repository: PlaceQueryRepository) {}

  async execute({ slug, tenantId, options }: Command): Promise<boolean> {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) {
      return false;
    }

    if (placeQueryPolicy.requireTenant && !tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.existsWithSlug({
      slug: normalizedSlug,
      tenantId: tenantId ?? undefined,
      options,
    });
  }
}
