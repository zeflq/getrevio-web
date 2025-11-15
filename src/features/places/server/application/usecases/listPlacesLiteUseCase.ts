import { placeFiltersSchema } from "@/features/places/model/placeSchema";
import { placeQueryPolicy } from "../../policy";

import type { PlaceQueryOptions, PlaceQueryRepository } from "../interfaces/placeQueryRepository";

export class ListPlacesLiteUseCase {
  constructor(private readonly repository: PlaceQueryRepository) {}

  async execute(args: {
    filters: unknown;
    tenantId?: string | null;
    options?: PlaceQueryOptions;
  }) {
    const parsed = placeFiltersSchema.parse(args.filters);
    const filters = placeQueryPolicy.validateAndClamp(parsed);

    if (placeQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.listLite({
      filters,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
