import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import type {
  ShortlinkQueryRepository,
  ShortlinkQueryOptions,
} from "../../application/interfaces/shortlinkQueryRepository";
import type { ShortlinkFilters } from "../../model/shortlinkSchema";
import { buildShortlinkWhere } from "../../buildWhere";
import { shortlinkQueryPolicy } from "../../policy";
import { mapShortlinkRow } from "../../mappers";
import { shortlinkSelect } from "./shortlinkSelects";

const shortlinkSortPolicy = makeSortPolicy<ShortlinkFilters>({
  allowed: ["code", "merchantId", "channel", "createdAt", "updatedAt"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

export class PrismaShortlinkQueryRepository implements ShortlinkQueryRepository {
  constructor(private readonly client: Prisma.ShortlinkDelegate = prisma.shortlink) {}

  async list({ filters, tenantId, options }: {
    filters: ShortlinkFilters;
    tenantId?: string;
    options?: ShortlinkQueryOptions;
  }) {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = shortlinkSortPolicy.toOrderBy(filters.sort, filters.order, filters);
    const skip = (filters.page - 1) * filters.pageSize;

    const [total, rows] = await Promise.all([
      this.runWithTimeout(this.client.count({ where }), options),
      this.runWithTimeout(
        this.client.findMany({
          where,
          orderBy,
          skip,
          take: filters.pageSize,
          select: shortlinkSelect,
        }),
        options
      ),
    ]);

    return {
      data: rows.map(mapShortlinkRow),
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async getById({ id, tenantId, options }: {
    id: string;
    tenantId?: string;
    options?: ShortlinkQueryOptions;
  }) {
    const where = shortlinkQueryPolicy.enforceTenant(
      { id } as Prisma.ShortlinkWhereInput,
      tenantId,
      "merchantId"
    );

    const row = await this.runWithTimeout(
      this.client.findFirst({
        where,
        select: shortlinkSelect,
      }),
      options
    );

    return row ? mapShortlinkRow(row) : null;
  }

  private buildScopedWhere(filters: ShortlinkFilters, tenantId?: string) {
    const where0 = buildShortlinkWhere(filters, tenantId);
    return shortlinkQueryPolicy.enforceTenant(where0, tenantId, "merchantId");
  }

  private runWithTimeout<T>(promise: Promise<T>, options?: ShortlinkQueryOptions) {
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
