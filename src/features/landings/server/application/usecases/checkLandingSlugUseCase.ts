import { landingQueryPolicy } from "../../policy";
import type { LandingQueryRepository, LandingQueryOptions } from "../interfaces/landingQueryRepository";

type Command = {
  slug: string;
  tenantId?: string | null;
  options?: LandingQueryOptions;
};

export class CheckLandingSlugUseCase {
  constructor(private readonly repository: LandingQueryRepository) {}

  async execute({ slug, tenantId, options }: Command): Promise<boolean> {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) {
      return false;
    }

    if (landingQueryPolicy.requireTenant && !tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.existsWithSlug({
      slug: normalizedSlug,
      tenantId: tenantId ?? undefined,
      options,
    });
  }
}
