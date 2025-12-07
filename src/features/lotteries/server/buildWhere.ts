import type { Prisma } from "@/generated/client";

import type { LotteryFilters } from "@/features/lotteries/model/lotterySchema";

export const buildLotteryConfigWhere = (
  filters: LotteryFilters,
  tenantId?: string
): Prisma.LotteryConfigWhereInput => ({
  ...(filters.q
    ? {
        name: { contains: filters.q, mode: "insensitive" },
      }
    : {}),
  ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
  ...(tenantId ? { merchantId: tenantId } : {}),
});
