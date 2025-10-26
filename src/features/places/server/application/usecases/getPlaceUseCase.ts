import { placeQueryPolicy } from "../../policy";

import type { PlaceQueryOptions, PlaceQueryRepository } from "../interfaces/placeQueryRepository";

export class GetPlaceUseCase {
  constructor(private readonly repository: PlaceQueryRepository) {}

  async execute(args: {
    id: string;
    tenantId?: string | null;
    options?: PlaceQueryOptions;
  }) {
    if (placeQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.getById({
      id: args.id,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
