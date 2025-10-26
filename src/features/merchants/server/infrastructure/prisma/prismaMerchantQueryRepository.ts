import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import type {
  MerchantQueryRepository,
  MerchantQueryOptions,
} from "../../application/interfaces/merchantQueryRepository";
import { buildMerchantWhere } from "../../buildWhere";
import { merchantQueryPolicy } from "../../policy";
import { mapMerchantLite, mapMerchantRow, type MerchantListDTO } from "../../mappers";
import { MerchantFilters } from "@/features/merchants/model/merchantSchema";
import { merchantLiteSelect, merchantSelect } from "./merchantSelects";

const merchantSortPolicy = makeSortPolicy<MerchantFilters>({
  allowed: ["name", "createdAt", "plan", "status"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

const merchantLiteSortPolicy = makeSortPolicy<MerchantFilters>({
  allowed: ["name"],
  defaultKey: "name",
  defaultDir: "asc",
});

export class PrismaMerchantQueryRepository implements MerchantQueryRepository {
  constructor(private readonly client: Prisma.MerchantDelegate = prisma.merchant) {}

  async list({ filters, tenantId, options }: {
    filters: MerchantFilters;
    tenantId?: string;
    options?: MerchantQueryOptions;
  }): Promise<{ data: MerchantListDTO[]; total: number; totalPages: number }> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = this.resolveOrderBy(filters);
    const skip = (filters.page - 1) * filters.pageSize;

    const [total, rows] = await Promise.all([
      this.runWithTimeout(
        this.client.count({ where }),
        options
      ),
      this.runWithTimeout(
        this.client.findMany({
          where,
          orderBy,
          skip,
          take: filters.pageSize,
          select: merchantSelect,
        }),
        options
      ),
    ]);

    return {
      data: rows.map(mapMerchantRow),
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async getById({ id, tenantId, options }: {
    id: string;
    tenantId?: string;
    options?: MerchantQueryOptions;
  }): Promise<MerchantListDTO | null> {
    const baseWhere = { id } as Prisma.MerchantWhereInput;
    const where = merchantQueryPolicy.enforceTenant(baseWhere, tenantId, "tenantId");

    const row = await this.runWithTimeout(
      this.client.findFirst({
        where,
        select: merchantSelect,
      }),
      options
    );

    return row ? mapMerchantRow(row) : null;
  }

  async listLite({ filters, tenantId, options }: {
    filters: MerchantFilters;
    tenantId?: string;
    options?: MerchantQueryOptions;
  }): Promise<{ value: string; label: string }[]> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = this.resolveOrderBy(filters, true);
    const requested = filters.pageSize ?? 20;
    const take = Math.max(1, Math.min(requested, Math.min(50, merchantQueryPolicy.maxPageSize)));

    const rows = await this.runWithTimeout(
      this.client.findMany({
        where,
        orderBy,
        take,
        select: merchantLiteSelect,
      }),
      options
    );

    return rows.map(mapMerchantLite);
  }

  private buildScopedWhere(filters: MerchantFilters, tenantId?: string) {
    const where0 = buildMerchantWhere(filters, tenantId);
    return merchantQueryPolicy.enforceTenant(where0, tenantId, "tenantId");
  }

  private resolveOrderBy(filters: MerchantFilters, lite = false) {
    const policy = lite ? merchantLiteSortPolicy : merchantSortPolicy;
    const sortKey = (filters.sort ?? policy.defaultKey) as string;
    const dir = (filters.order ?? policy.defaultDir) as "asc" | "desc";
    return policy.toOrderBy(sortKey, dir, filters);
  }

  private runWithTimeout<T>(promise: Promise<T>, options?: MerchantQueryOptions) {
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
