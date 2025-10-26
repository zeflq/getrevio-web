import { themeQueryPolicy } from "../../policy";

import type { ThemeQueryOptions, ThemeQueryRepository } from "../interfaces/themeQueryRepository";

export class GetThemeUseCase {
  constructor(private readonly repository: ThemeQueryRepository) {}

  async execute(args: {
    id: string;
    tenantId?: string | null;
    options?: ThemeQueryOptions;
  }) {
    if (themeQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.getById({
      id: args.id,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
