import { shortlinkQueryPolicy } from "../../policy";

import type { ShortlinkQueryOptions, ShortlinkQueryRepository } from "../interfaces/shortlinkQueryRepository";

export class GetShortlinkUseCase {
  constructor(private readonly repository: ShortlinkQueryRepository) {}

  async execute(args: {
    id: string;
    tenantId?: string | null;
    options?: ShortlinkQueryOptions;
  }) {
    if (shortlinkQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.getById({
      id: args.id,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
