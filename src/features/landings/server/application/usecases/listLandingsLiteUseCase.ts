import type { LandingFilters } from "@/features/landings/model/landingSchema";

import type { LandingQueryRepository, LandingQueryOptions } from "../interfaces/landingQueryRepository";

export class ListLandingsLiteUseCase {
  constructor(private readonly repository: LandingQueryRepository) {}

  execute(args: {
    filters: LandingFilters;
    tenantId?: string;
    options?: LandingQueryOptions;
  }) {
    return this.repository.listLite(args);
  }
}
