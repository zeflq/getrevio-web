import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import type {
  ThemeQueryRepository,
  ThemeQueryOptions,
} from "../../application/interfaces/themeQueryRepository";
import type { ThemeFilters } from "../../model/themeSchema";
import { buildThemeWhere } from "../../buildWhere";
import { themeQueryPolicy } from "../../policy";
import { mapThemeRow, type ThemeListDTO } from "../../mappers";
import { themeLiteSelect, themeSelect } from "./themeSelects";

const themeSortPolicy = makeSortPolicy<ThemeFilters>({
  allowed: ["name", "createdAt"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

const themeLiteSortPolicy = makeSortPolicy<ThemeFilters>({
  allowed: ["name"],
  defaultKey: "name",
  defaultDir: "asc",
});

export class PrismaThemeQueryRepository implements ThemeQueryRepository {
  constructor(private readonly client: Prisma.ThemeDelegate = prisma.theme) {}

  async list({ filters, tenantId, options }: {
    filters: ThemeFilters;
    tenantId?: string;
    options?: ThemeQueryOptions;
  }): Promise<{ data: ThemeListDTO[]; total: number; totalPages: number }> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = themeSortPolicy.toOrderBy(filters.sort, filters.order, filters);
    const skip = (filters.page - 1) * filters.pageSize;

    const [total, rows] = await Promise.all([
      this.runWithTimeout(this.client.count({ where }), options),
      this.runWithTimeout(
        this.client.findMany({
          where,
          orderBy,
          skip,
          take: filters.pageSize,
          select: themeSelect,
        }),
        options
      ),
    ]);

    return {
      data: rows.map(mapThemeRow),
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async getById({ id, tenantId, options }: {
    id: string;
    tenantId?: string;
    options?: ThemeQueryOptions;
  }): Promise<ThemeListDTO | null> {
    const where = themeQueryPolicy.enforceTenant(
      { id } as Prisma.ThemeWhereInput,
      tenantId,
      "merchantId"
    );

    const row = await this.runWithTimeout(
      this.client.findFirst({
        where,
        select: themeSelect,
      }),
      options
    );

    return row ? mapThemeRow(row) : null;
  }

  async listLite({ filters, tenantId, options }: {
    filters: ThemeFilters;
    tenantId?: string;
    options?: ThemeQueryOptions;
  }): Promise<{ value: string; label: string }[]> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = themeLiteSortPolicy.toOrderBy(themeLiteSortPolicy.defaultKey, themeLiteSortPolicy.defaultDir, filters);
    const requested = filters.pageSize ?? 20;
    const take = Math.max(1, Math.min(requested, Math.min(50, themeQueryPolicy.maxPageSize)));

    const rows = await this.runWithTimeout(
      this.client.findMany({
        where,
        orderBy,
        take,
        select: themeLiteSelect,
      }),
      options
    );

    return rows.map((row) => ({ value: row.id, label: row.name ?? row.id }));
  }

  private buildScopedWhere(filters: ThemeFilters, tenantId?: string) {
    const where0 = buildThemeWhere(filters, tenantId);
    return themeQueryPolicy.enforceTenant(where0, tenantId, "merchantId");
  }

  private runWithTimeout<T>(promise: Promise<T>, options?: ThemeQueryOptions) {
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
