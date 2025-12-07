import { Prisma } from "@/generated/client";

import prisma from "@/lib/prisma";
import { makeSortPolicy } from "@/server/core/policies/sortPolicy";

import type {
  PlaceQueryRepository,
  PlaceQueryOptions,
} from "../../application/interfaces/placeQueryRepository";
import { buildPlaceWhere } from "../../buildWhere";
import { placeQueryPolicy } from "../../policy";
import { mapPlaceRow, type PlaceListDTO } from "../../mappers";
import { placeLiteSelect, placeSelect } from "./placeSelects";
import { PlaceFilters } from "@/features/places/model/placeSchema";

const placeSortPolicy = makeSortPolicy<PlaceFilters>({
  allowed: ["localName", "createdAt"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});

const placeLiteSortPolicy = makeSortPolicy<PlaceFilters>({
  allowed: ["localName"],
  defaultKey: "localName",
  defaultDir: "asc",
});

export class PrismaPlaceQueryRepository implements PlaceQueryRepository {
  constructor(private readonly client: Prisma.PlaceDelegate = prisma.place) {}

  async list({ filters, tenantId, options }: {
    filters: PlaceFilters;
    tenantId?: string;
    options?: PlaceQueryOptions;
  }): Promise<{ data: PlaceListDTO[]; total: number; totalPages: number }> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = placeSortPolicy.toOrderBy(filters.sort, filters.order, filters);
    const skip = (filters.page - 1) * filters.pageSize;

    const [total, rows] = await Promise.all([
      this.runWithTimeout(this.client.count({ where }), options),
      this.runWithTimeout(
        this.client.findMany({
          where,
          orderBy,
          skip,
          take: filters.pageSize,
          select: placeSelect,
        }),
        options
      ),
    ]);

    return {
      data: rows.map(mapPlaceRow),
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async getById({ id, tenantId, options }: {
    id: string;
    tenantId?: string;
    options?: PlaceQueryOptions;
  }): Promise<PlaceListDTO | null> {
    const where = placeQueryPolicy.enforceTenant(
      { id } as Prisma.PlaceWhereInput,
      tenantId,
      "merchantId"
    );

    const row = await this.runWithTimeout(
      this.client.findFirst({
        where,
        select: placeSelect,
      }),
      options
    );

    return row ? mapPlaceRow(row) : null;
  }

  async listLite({ filters, tenantId, options }: {
    filters: PlaceFilters;
    tenantId?: string;
    options?: PlaceQueryOptions;
  }): Promise<{ value: string; label: string }[]> {
    const where = this.buildScopedWhere(filters, tenantId);
    const orderBy = placeLiteSortPolicy.toOrderBy(placeLiteSortPolicy.defaultKey, placeLiteSortPolicy.defaultDir, filters);
    const requested = filters.pageSize ?? 20;
    const take = Math.max(1, Math.min(requested, Math.min(50, placeQueryPolicy.maxPageSize)));

    const rows = await this.runWithTimeout(
      this.client.findMany({
        where,
        orderBy,
        take,
        select: placeLiteSelect,
      }),
      options
    );

    return rows.map((row) => ({
      value: row.id,
      label: row.localName ?? row.id,
      googlePlaceId: row.googlePlaceId ?? null,
    }));
  }

  private buildScopedWhere(filters: PlaceFilters, tenantId?: string) {
    const where0 = buildPlaceWhere(filters, tenantId);
    return placeQueryPolicy.enforceTenant(where0, tenantId, "merchantId");
  }

  private runWithTimeout<T>(promise: Promise<T>, options?: PlaceQueryOptions) {
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
