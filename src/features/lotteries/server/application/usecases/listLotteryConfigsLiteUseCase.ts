import { lotteryFiltersSchema } from "@/features/lotteries/model/lotterySchema";
import { lotteryQueryPolicy } from "../../policy";

import type { LotteryQueryOptions, LotteryConfigQueryRepository } from "../interfaces/lotteryConfigQueryRepository";

export class ListLotteryConfigsLiteUseCase {
  constructor(private readonly repository: LotteryConfigQueryRepository) {}

  async execute(args: {
    filters: unknown;
    tenantId?: string | null;
    options?: LotteryQueryOptions;
  }) {
    const parsed = lotteryFiltersSchema.parse(args.filters);
    const filters = lotteryQueryPolicy.validateAndClamp(parsed);

    if (lotteryQueryPolicy.requireTenant && !args.tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    return this.repository.listLite({
      filters,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
