import type { Prisma } from "@/generated/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { LotteryFilters } from "@/features/lotteries/model/lotterySchema";

export const lotteryQueryPolicy = createQueryPolicy<LotteryFilters, Prisma.LotteryConfigWhereInput>({
  maxPageSize: 50,
  maxWindow: 500,
  tenantKey: "merchantId",
});
