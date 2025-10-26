import { themeFiltersSchema } from "@/features/themes/model/themeSchema";
import { themeQueryPolicy } from "../../policy";

import type { ThemeQueryOptions, ThemeQueryRepository } from "../interfaces/themeQueryRepository";

export class ListThemesLiteUseCase {
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

    return this.repository.listLite({
      filters,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
