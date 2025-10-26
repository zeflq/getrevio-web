import { merchantQueryPolicy } from "../../policy";

import type {
  MerchantQueryOptions,
  MerchantQueryRepository,
} from "../interfaces/merchantQueryRepository";

export class GetMerchantUseCase {
  constructor(private readonly repository: MerchantQueryRepository) {}

  async execute(args: {
    id: string;
    tenantId?: string | null;
    options?: MerchantQueryOptions;
  }) {
    if (merchantQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.getById({
      id: args.id,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
