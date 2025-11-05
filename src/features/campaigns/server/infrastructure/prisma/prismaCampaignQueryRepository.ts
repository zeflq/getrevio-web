import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import type {
  CampaignQueryRepository,
  CampaignQueryOptions,
  CampaignLiteItem,
} from "../../application/interfaces/campaignQueryRepository";
import { buildCampaignWhere } from "../../buildWhere";
import { campaignQueryPolicy } from "../../policy";
import { mapCampaignRow, type CampaignListDTO } from "../../mappers";
import { campaignLiteSelect, campaignSelect } from "./campaignSelects";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";
import { CampaignFilters } from "@/features/campaigns/model/campaignSchema";

const campaignSortPolicy = makeSortPolicy<CampaignFilters>({
  allowed: ["name", "createdAt", "status"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

const campaignLiteSortPolicy = makeSortPolicy<CampaignFilters>({
  allowed: ["name"],
  defaultKey: "name",
  defaultDir: "asc",
});

export class PrismaCampaignQueryRepository implements CampaignQueryRepository {
  constructor(private readonly client: Prisma.CampaignDelegate = prisma.campaign) {}

  async list({ filters, tenantId, options }: {
    filters: CampaignFilters;
    tenantId?: string;
    options?: CampaignQueryOptions;
  }): Promise<{ data: CampaignListDTO[]; total: number; totalPages: number }> {
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
          select: campaignSelect,
        }),
        options
      ),
    ]);

    return {
      data: rows.map(mapCampaignRow),
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async getById({ id, tenantId, options }: {
    id: string;
    tenantId?: string;
    options?: CampaignQueryOptions;
  }): Promise<CampaignListDTO | null> {
    const where = campaignQueryPolicy.enforceTenant(
      { id } as Prisma.CampaignWhereInput,
      tenantId,
      "merchantId"
    );

    const row = await this.runWithTimeout(
      this.client.findFirst({
        where,
        select: campaignSelect,
      }),
      options
    );

    return row ? mapCampaignRow(row) : null;
  }

  async listLite({ filters, tenantId, options }: {
    filters: CampaignFilters;
    tenantId?: string;
    options?: CampaignQueryOptions;
  }): Promise<CampaignLiteItem[]> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = this.resolveOrderBy(filters, true);
    const requested = filters.pageSize ?? 20;
    const take = Math.max(1, Math.min(requested, Math.min(50, campaignQueryPolicy.maxPageSize)));

    const rows = await this.runWithTimeout(
      this.client.findMany({
        where,
        orderBy,
        take,
        select: campaignLiteSelect,
      }),
      options
    );

    return rows.map((row) => ({
      value: row.id,
      label: row.name ?? row.id,
      placeId: row.placeId ?? undefined,
    }));
  }

  private buildScopedWhere(filters: CampaignFilters, tenantId?: string) {
    const where0 = buildCampaignWhere(filters, tenantId);
    return campaignQueryPolicy.enforceTenant(where0, tenantId, "merchantId");
  }

  private resolveOrderBy(filters: CampaignFilters, lite = false) {
    const policy = lite ? campaignLiteSortPolicy : campaignSortPolicy;
    const sortKey = (filters.sort ?? policy.defaultKey) as string;
    const dir = (filters.order ?? policy.defaultDir) as "asc" | "desc";
    return policy.toOrderBy(sortKey, dir, filters);
  }

  private runWithTimeout<T>(promise: Promise<T>, options?: CampaignQueryOptions) {
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
