import { themeFiltersSchema } from "@/features/themes/model/themeSchema";
import { themeQueryPolicy } from "../../policy";

import type { ThemeQueryOptions, ThemeQueryRepository } from "../interfaces/themeQueryRepository";

export class ListThemesUseCase {
  constructor(private readonly repository: ThemeQueryRepository) {}

  async execute(args: {
    filters: unknown;
    tenantId?: string | null;
    options?: ThemeQueryOptions;
  }) {
    const parsed = themeFiltersSchema.parse(args.filters);
    const filters = themeQueryPolicy.validateAndClamp(parsed);

    if (themeQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    const skip = (filters.page - 1) * filters.pageSize;
    if (skip + filters.pageSize > themeQueryPolicy.maxWindow) {
      throw new Error("Requested window exceeds allowed limit.");
    }

    return this.repository.list({
      filters,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
