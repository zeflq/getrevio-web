import { z } from "zod";

import { defaultLiteMapper } from "../mappers/defaultMappers";
import type { PagedFilters, QueryPolicy } from "../policies/queryPolicy";
import type { ReadRepo } from "../repos/types";

export type QueryOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type WithTimeout = <T>(promise: Promise<T>, timeoutMs?: number) => Promise<T>;

export type SortPolicy<F> = {
  allowed: readonly string[];
  defaultKey: string;
  defaultDir: "asc" | "desc";
  toOrderBy: (key: string, dir: "asc" | "desc" | undefined, filters: F) => any;
};

const defaultWithTimeout: WithTimeout = async <T>(promise: Promise<T>, timeoutMs?: number): Promise<T> => {
  if (!timeoutMs || timeoutMs <= 0) return promise;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Operation timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

type LiteConfig<TFilters, TLiteRow, TLite, TSelectLite> = {
  select?: TSelectLite;
  mapLite?: (row: TLiteRow) => TLite;
  defaultLimit?: number;
  maxLimit?: number;
  sort?: SortPolicy<TFilters>;
};

type CreateServerQueriesOptions<
  TRow,
  TPublic,
  TWhere,
  TSelect,
  TFilters extends PagedFilters,
  TLiteRow,
  TLite,
  TSelectLite
> = {
  repo: ReadRepo<TRow, TWhere, TSelect>;
  liteRepo?: ReadRepo<TLiteRow, TWhere, TSelectLite>;
  policy: QueryPolicy<TFilters, TWhere>;
  filterSchema: z.ZodType<TFilters>;
  buildWhere: (filters: TFilters, tenantId?: string) => TWhere;
  tenantKey?: string;
  idKey?: string;
  select?: TSelect;
  mapRow?: (row: TRow) => TPublic;
  sort?: SortPolicy<TFilters>;
  lite?: LiteConfig<TFilters, TLiteRow, TLite, TSelectLite>;
  withTimeout?: WithTimeout;
  authorize?: (args: {
    action: "list" | "getById" | "listLite";
    tenantId?: string;
    filters?: TFilters;
    id?: string;
  }) => Promise<void> | void;
};

export type ListEnvelope<T> = { data: T[]; total: number; totalPages: number };

export function createServerQueries<
  TRow,
  TPublic = TRow,
  TWhere = any,
  TSelect = any,
  TFilters extends PagedFilters = PagedFilters,
  TLiteRow = TRow,
  TLite = any,
  TSelectLite = any
>(opts: CreateServerQueriesOptions<TRow, TPublic, TWhere, TSelect, TFilters, TLiteRow, TLite, TSelectLite>) {
  const {
    repo,
    liteRepo,
    policy,
    filterSchema,
    buildWhere,
    tenantKey = "tenantId",
    idKey = "id",
    select,
    mapRow = (row: TRow) => row as unknown as TPublic,
    sort,
    lite,
    withTimeout = defaultWithTimeout,
    authorize,
  } = opts;

  const resolveOrderBy = (filters: TFilters, policy?: SortPolicy<TFilters>) => {
    if (!policy) return undefined;
    const sortKey = ((filters as unknown as { sort?: string }).sort ?? policy.defaultKey) as string;
    const dir =
      (filters as unknown as { dir?: "asc" | "desc"; order?: "asc" | "desc" }).dir ??
      (filters as unknown as { dir?: "asc" | "desc"; order?: "asc" | "desc" }).order ??
      policy.defaultDir;
    return policy.toOrderBy(sortKey, dir, filters);
  };

  const runWithTimeout = <T>(promise: Promise<T>, options?: QueryOptions) =>
    withTimeout(promise, options?.timeoutMs);

  async function list(
    tenantIdOrFilters: string | TFilters | unknown,
    maybeFilters?: unknown,
    options?: QueryOptions
  ): Promise<ListEnvelope<TPublic>> {
    const hasTenant = typeof tenantIdOrFilters === "string";
    const tenantId = hasTenant ? (tenantIdOrFilters as string) : undefined;
    const rawFilters = hasTenant ? maybeFilters : tenantIdOrFilters;

    if (policy.requireTenant && !tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    await authorize?.({
      action: "list",
      tenantId,
      filters: rawFilters as TFilters,
    });

    const parsed = filterSchema.parse(rawFilters);
    const filters = policy.validateAndClamp(parsed);
    const where0 = buildWhere(filters, tenantId);
    const where = policy.enforceTenant(where0, tenantId, tenantKey);
    const orderBy = sort ? resolveOrderBy(filters, sort) : undefined;
    const skip = (filters.page - 1) * filters.pageSize;

    if (skip + filters.pageSize > policy.maxWindow) {
      throw new Error("Requested window exceeds allowed limit.");
    }

    const [total, rows] = await Promise.all([
      runWithTimeout(
        repo.count({
          where,
          signal: options?.signal,
        }),
        options
      ),
      runWithTimeout(
        repo.findMany({
          where,
          orderBy,
          skip,
          take: filters.pageSize,
          select,
          signal: options?.signal,
        }),
        options
      ),
    ]);

    return {
      data: (rows as TRow[]).map(mapRow),
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async function getById(
    tenantIdOrId: string,
    maybeId?: string,
    options?: QueryOptions
  ): Promise<TPublic | null> {
    const hasTenant = typeof maybeId === "string";
    const id = hasTenant ? (maybeId as string) : (tenantIdOrId as string);
    const tenantId = hasTenant ? (tenantIdOrId as string) : undefined;

    if (policy.requireTenant && !tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    await authorize?.({
      action: "getById",
      tenantId,
      id,
    });

    const baseWhere = { [idKey]: id } as unknown as TWhere;
    const where = policy.enforceTenant(baseWhere, tenantId, tenantKey);

    const row = await runWithTimeout(
      repo.findFirst({
        where,
        select,
        signal: options?.signal,
      }),
      options
    );

    return row ? mapRow(row as TRow) : null;
  }

  async function listLite(
    tenantIdOrFilters: string | TFilters | unknown,
    maybeFilters?: unknown,
    options?: QueryOptions
  ): Promise<TLite[]> {
    if (!lite) {
      throw new Error("Lite list is not configured for this resource.");
    }

    const liteRepository: ReadRepo<TLiteRow, TWhere, TSelectLite> = (liteRepo as ReadRepo<TLiteRow, TWhere, TSelectLite>) ?? (repo as unknown as ReadRepo<TLiteRow, TWhere, TSelectLite>);
    const { select: liteSelect, mapLite, defaultLimit = 20, maxLimit = 50, sort: liteSort } = lite;

    const hasTenant = typeof tenantIdOrFilters === "string";
    const tenantId = hasTenant ? (tenantIdOrFilters as string) : undefined;
    const rawFilters = hasTenant ? maybeFilters : tenantIdOrFilters;

    if (policy.requireTenant && !tenantId) {
      throw new Error("Tenant id is required for this resource.");
    }

    await authorize?.({
      action: "listLite",
      tenantId,
      filters: rawFilters as TFilters,
    });

    const parsed = filterSchema.parse(rawFilters);
    const filters = policy.validateAndClamp(parsed);
    const requested = (filters as unknown as { pageSize?: number }).pageSize ?? defaultLimit;
    const take = Math.max(1, Math.min(requested, Math.min(maxLimit, policy.maxPageSize)));

    const where0 = buildWhere(filters, tenantId);
    const where = policy.enforceTenant(where0, tenantId, tenantKey);
    const orderBy = liteSort ? resolveOrderBy(filters, liteSort) : undefined;

    const raw = await runWithTimeout(
      liteRepository.findMany({
        where,
        orderBy,
        take,
        select: liteSelect,
        signal: options?.signal,
      }),
      options
    );

    const projector = (mapLite ?? defaultLiteMapper) as (row: TLiteRow) => TLite;
    return (raw as TLiteRow[]).map(projector);
  }

  return {
    list,
    getById,
    listLite,
  };
}
