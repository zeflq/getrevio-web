import { shortlinkFiltersSchema } from "@/features/shortlinks/model/shortlinkSchema";
import { shortlinkQueryPolicy } from "../../policy";

import type { ShortlinkQueryOptions, ShortlinkQueryRepository } from "../interfaces/shortlinkQueryRepository";

export class ListShortlinksUseCase {
  constructor(private readonly repository: ShortlinkQueryRepository) {}

  async execute(args: {
    filters: unknown;
    tenantId?: string | null;
    options?: ShortlinkQueryOptions;
  }) {
    const parsed = shortlinkFiltersSchema.parse(args.filters);
    const filters = shortlinkQueryPolicy.validateAndClamp(parsed);

    if (shortlinkQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    const skip = (filters.page - 1) * filters.pageSize;
    if (skip + filters.pageSize > shortlinkQueryPolicy.maxWindow) {
      throw new Error("Requested window exceeds allowed limit.");
    }

    return this.repository.list({
      filters,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
