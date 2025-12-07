import type { LotteryFilters } from "@/features/lotteries/model/lotterySchema";
import type { LotteryConfigDetailDTO, LotteryConfigListDTO } from "@/features/lotteries/server/mappers";

export type LotteryQueryOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export interface LotteryConfigQueryRepository {
  list(args: {
    filters: LotteryFilters;
    tenantId?: string;
    options?: LotteryQueryOptions;
  }): Promise<{ data: LotteryConfigListDTO[]; total: number; totalPages: number }>;

  getById(args: {
    id: string;
    tenantId?: string;
    options?: LotteryQueryOptions;
  }): Promise<LotteryConfigDetailDTO | null>;
}
