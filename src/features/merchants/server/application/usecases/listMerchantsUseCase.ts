import { merchantFiltersSchema } from "@/features/merchants/model/merchantSchema";

import { merchantQueryPolicy } from "../../policy";

import type {
  MerchantQueryOptions,
  MerchantQueryRepository,
} from "../interfaces/merchantQueryRepository";

export class ListMerchantsUseCase {
  constructor(private readonly repository: MerchantQueryRepository) {}

  async execute(args: {
    filters: unknown;
    tenantId?: string | null;
    options?: MerchantQueryOptions;
  }) {
    const parsed = merchantFiltersSchema.parse(args.filters);
    const filters = merchantQueryPolicy.validateAndClamp(parsed);

    if (merchantQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    const skip = (filters.page - 1) * filters.pageSize;
    if (skip + filters.pageSize > merchantQueryPolicy.maxWindow) {
      throw new Error("Requested window exceeds allowed limit.");
    }

    return this.repository.list({
      filters,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
