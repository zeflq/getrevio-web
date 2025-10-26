import { merchantFiltersSchema } from "@/features/merchants/model/merchantSchema";

import { merchantQueryPolicy } from "../../policy";

import type {
  MerchantQueryOptions,
  MerchantQueryRepository,
} from "../interfaces/merchantQueryRepository";

export class ListMerchantsLiteUseCase {
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

    return this.repository.listLite({
      filters,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
