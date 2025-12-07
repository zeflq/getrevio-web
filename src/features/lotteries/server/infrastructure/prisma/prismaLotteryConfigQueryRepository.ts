
import prisma from "@/lib/prisma";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import type {
  LotteryConfigQueryRepository,
  LotteryQueryOptions,
} from "@/features/lotteries/server/application/interfaces/lotteryConfigQueryRepository";
import type { LotteryFilters } from "@/features/lotteries/model/lotterySchema";
import { buildLotteryConfigWhere } from "@/features/lotteries/server/buildWhere";
import { lotteryQueryPolicy } from "@/features/lotteries/server/policy";
import {
  lotteryConfigSelect,
  mapLotteryConfigRowToDetail,
  mapLotteryConfigRowToList,
  type LotteryConfigListDTO,
} from "@/features/lotteries/server/mappers";
import { Prisma } from "@/generated/client";

const lotterySortPolicy = makeSortPolicy<LotteryFilters>({
  allowed: ["name", "createdAt"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

export class PrismaLotteryConfigQueryRepository implements LotteryConfigQueryRepository {
  constructor(private readonly client: Prisma.LotteryConfigDelegate = prisma.lotteryConfig) {}

  async list({ filters, tenantId, options }: {
    filters: LotteryFilters;
    tenantId?: string;
    options?: LotteryQueryOptions;
  }): Promise<{ data: LotteryConfigListDTO[]; total: number; totalPages: number }> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = lotterySortPolicy.toOrderBy(filters.sort, filters.order, filters);
    const skip = (filters.page - 1) * filters.pageSize;

    const [total, rows] = await Promise.all([
      this.runWithTimeout(this.client.count({ where }), options),
      this.runWithTimeout(
        this.client.findMany({
          where,
          orderBy,
          skip,
          take: filters.pageSize,
          select: lotteryConfigSelect,
        }),
        options
      ),
    ]);

    return {
      data: rows.map(mapLotteryConfigRowToList),
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async getById({ id, tenantId, options }: {
    id: string;
    tenantId?: string;
    options?: LotteryQueryOptions;
  }) {
    const where = lotteryQueryPolicy.enforceTenant(
      { id } as Prisma.LotteryConfigWhereInput,
      tenantId,
      "merchantId"
    );

    const row = await this.runWithTimeout(
      this.client.findFirst({
        where,
        select: lotteryConfigSelect,
      }),
      options
    );

    return row ? mapLotteryConfigRowToDetail(row) : null;
  }

  private buildScopedWhere(filters: LotteryFilters, tenantId?: string) {
    const where = buildLotteryConfigWhere(filters, tenantId);
    return lotteryQueryPolicy.enforceTenant(where, tenantId, "merchantId");
  }

  private runWithTimeout<T>(promise: Promise<T>, options?: LotteryQueryOptions) {
    if (!options?.timeoutMs || options.timeoutMs <= 0) return promise;

    let timer: ReturnType<typeof setTimeout> | undefined;
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Operation timed out")), options.timeoutMs);
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });
  }
}
