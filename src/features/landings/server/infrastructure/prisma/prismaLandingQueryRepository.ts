import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import type {
  LandingQueryRepository,
  LandingQueryOptions,
} from "../../application/interfaces/landingQueryRepository";
import { buildLandingWhere } from "../../buildWhere";
import { landingQueryPolicy } from "../../policy";
import { mapLandingRow, type LandingListDTO } from "../../mappers";
import { mapMerchantRow, type MerchantListDTO } from "@/features/merchants/server/mappers";
import { landingLiteSelect, landingSelect } from "./landingSelects";
import { LandingFilters } from "@/features/landings/model/landingSchema";

const landingSortPolicy = makeSortPolicy<LandingFilters>({
  allowed: ["name", "createdAt", "status"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

const landingLiteSortPolicy = makeSortPolicy<LandingFilters>({
  allowed: ["name"],
  defaultKey: "name",
  defaultDir: "asc",
});

export class PrismaLandingQueryRepository implements LandingQueryRepository {
  constructor(private readonly client: Prisma.LandingDelegate = prisma.landing) {}

  async list({
    filters,
    tenantId,
    options,
  }: {
    filters: LandingFilters;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<{ data: LandingListDTO[]; total: number; totalPages: number }> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = landingSortPolicy.toOrderBy(filters.sort, filters.order, filters);
    const skip = (filters.page - 1) * filters.pageSize;

    const [total, rows] = await Promise.all([
      this.runWithTimeout(this.client.count({ where }), options),
      this.runWithTimeout(
        this.client.findMany({
          where,
          orderBy,
          skip,
          take: filters.pageSize,
          select: landingSelect,
        }),
        options
      ),
    ]);

    return {
      data: rows.map(mapLandingRow),
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async getById({
    id,
    tenantId,
    options,
  }: {
    id: string;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<LandingListDTO | null> {
    const where = landingQueryPolicy.enforceTenant(
      { id } as Prisma.LandingWhereInput,
      tenantId,
      "merchantId"
    );

    const row = await this.runWithTimeout(
      this.client.findFirst({
        where,
        select: landingSelect,
      }),
      options
    );

    return row ? mapLandingRow(row) : null;
  }

  async existsWithSlug({
    slug,
    tenantId,
    options,
  }: {
    slug: string;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<boolean> {
    const where = landingQueryPolicy.enforceTenant(
      { slug } as Prisma.LandingWhereInput,
      tenantId,
      "merchantId"
    );

    const count = await this.runWithTimeout(this.client.count({ where }), options);
    return count > 0;
  }

  async listLite({
    filters,
    tenantId,
    options,
  }: {
    filters: LandingFilters;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<{ value: string; label: string }[]> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = landingLiteSortPolicy.toOrderBy(
      landingLiteSortPolicy.defaultKey,
      landingLiteSortPolicy.defaultDir,
      filters
    );
    const requested = filters.pageSize ?? 20;
    const take = Math.max(1, Math.min(requested, Math.min(50, landingQueryPolicy.maxPageSize)));

    const rows = await this.runWithTimeout(
      this.client.findMany({
        where,
        orderBy,
        take,
        select: landingLiteSelect,
      }),
      options
    );

    return rows.map((row) => ({ value: row.id, label: row.name ?? row.id }));
  }

  private buildScopedWhere(filters: LandingFilters, tenantId?: string) {
    const where0 = buildLandingWhere(filters, tenantId);
    return landingQueryPolicy.enforceTenant(where0, tenantId, "merchantId");
  }

  async getLandingWithMerchant({
    id,
    tenantId,
    options,
  }: {
    id: string;
    tenantId?: string;
    options?: LandingQueryOptions;
  }): Promise<{ landing: LandingListDTO | null; merchant: MerchantListDTO | null } | null> {
    const where = landingQueryPolicy.enforceTenant(
      { id } as Prisma.LandingWhereInput,
      tenantId,
      "merchantId"
    );

    const row = await this.runWithTimeout(
      this.client.findFirst({
        where,
        select: {
          ...landingSelect,
          merchant: {
            select: {
              id: true,
              name: true,
              email: true,
              locale: true,
              defaultThemeId: true,
              plan: true,
              status: true,
              createdAt: true,
              slug: true,
            },
          },
        },
      }),
      options
    );

    if (!row) return null;

    return {
      landing: mapLandingRow(row),
      merchant: row.merchant ? mapMerchantRow(row.merchant) : null,
    };
  }

  private runWithTimeout<T>(promise: Promise<T>, options?: LandingQueryOptions) {
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
