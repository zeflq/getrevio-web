import type { LotteryQueryOptions, LotteryConfigQueryRepository } from "../interfaces/lotteryConfigQueryRepository";
import { lotteryFiltersSchema } from "@/features/lotteries/model/lotterySchema";
import { lotteryQueryPolicy } from "../../policy";

export class ListLotteryConfigsUseCase {
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

    const skip = (filters.page - 1) * filters.pageSize;
    if (skip + filters.pageSize > lotteryQueryPolicy.maxWindow) {
      throw new Error("Requested window exceeds allowed limit.");
    }

    return this.repository.list({
      filters,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
