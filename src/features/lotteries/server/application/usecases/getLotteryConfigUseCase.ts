import type { LotteryQueryOptions, LotteryConfigQueryRepository } from "../interfaces/lotteryConfigQueryRepository";

export class GetLotteryConfigUseCase {
  constructor(private readonly repository: LotteryConfigQueryRepository) {}

  async execute(args: { id: string; tenantId?: string | null; options?: LotteryQueryOptions }) {
    return this.repository.getById({
      id: args.id,
      tenantId: args.tenantId ?? undefined,
      options: args.options,
    });
  }
}
