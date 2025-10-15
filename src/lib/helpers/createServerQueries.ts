// src/server/helpers/createServerQueries.ts
import { z } from "zod";
import type { LiteListe } from "@/types/lists";

/** Standard list envelope returned to client tables. */
export type ListEnvelope<T> = { data: T[]; total: number; totalPages: number };

/** Minimal Prisma-like delegate surface needed by this factory. */
type PrismaLikeDelegate<TRow, TWhere, TSelect> = {
    count(args: { where: TWhere }): Promise<number>;
    findMany(args: {
        where: TWhere;
        orderBy?: any;
        skip?: number;
        take?: number;
        select?: TSelect;
    }): Promise<TRow[]>;
    findFirst(args: { where: TWhere; select?: TSelect }): Promise<TRow | null>;
};

/**
 * Factory to create server-side list/get helpers with:
 * - filter parsing (zod) + coercion
 * - tenant scoping (optional)
 * - pagination & dynamic sorting
 * - optional projection (select + mapRow)
 * - LITE list for comboboxes (label/value or any TLite)
 */
export function createServerQueries<
  TRow,                                // DB row type for main queries
  TPublic = TRow,                      // public DTO type for main list/get
  TWhere = any,                        // Prisma where type
  TSelect = any,                       // Prisma select type for main list/get
  TFilters extends { page: number; pageSize: number } = {
    page: number; pageSize: number;
  },
  TLiteRow = TRow,                     // DB row type used in lite list (can differ if select differs)
  TLite = LiteListe, // public DTO type for lite list
  TSelectLite = any                    // Prisma select type for lite list
>(opts: {
  /** e.g. prisma.merchant */
  delegate: PrismaLikeDelegate<TRow, TWhere, TSelect> & PrismaLikeDelegate<TLiteRow, TWhere, TSelectLite>;
  /** zod schema for filters (must include page/pageSize; may include sort/order/q/etc.) */
  filterSchema: z.ZodType<TFilters>;
  /** build Prisma where from filters (+ optional tenant id) */
  buildWhere: (filters: TFilters, tenantId?: string) => TWhere;
  /** default orderBy for main list, or a function receiving filters */
  orderBy?: any | ((filters: TFilters) => any);
  /** choose fields for main list/get (optional). If omitted, returns full rows. */
  select?: TSelect;
  /** id field name; used by getById (default: "id") */
  idKey?: string;
  /** field name used to scope queries by tenant (default: "tenantId") */
  tenantKey?: string;
  /** projector: DB row -> public DTO for main list/get (default: identity) */
  mapRow?: (row: TRow) => TPublic;

  /** LITE list options (optional) */
  lite?: {
    /** choose fields for lite list (keeps payload tiny) */
    select?: TSelectLite;
    /** projector: DB row -> lite DTO (default: {value:id,label:name} if present) */
    mapLite?: (row: TLiteRow) => TLite;
    /** default client-requested limit (fallback if filters don’t carry a limit) */
    defaultLimit?: number; // default 20
    /** hard cap on lite page size (safety) */
    maxLimit?: number; // default 50
    /** fixed or dynamic orderBy for lite list (default: by name asc if present; else none) */
    orderBy?: any | ((filters: TFilters) => any);
  };
}) {
  const {
    delegate,
    filterSchema,
    buildWhere,
    orderBy,
    select,
    idKey = "id",
    tenantKey = "merchantId",
    mapRow = (x) => x as unknown as TPublic,
    lite,
  } = opts;

  async function list(tenantIdOrFilters: string | TFilters | unknown, maybeFilters?: unknown): Promise<ListEnvelope<TPublic>> {
    // Support signatures: list(filters) OR list(tenantId, filters)
    const hasTenant = typeof tenantIdOrFilters === "string";
    const tenantId = hasTenant ? (tenantIdOrFilters as string) : undefined;
    const rawFilters = hasTenant ? maybeFilters : tenantIdOrFilters;

    const f = filterSchema.parse(rawFilters);
    const whereFilters = buildWhere(f, tenantId);
    const where =
      tenantId && tenantKey
        ? ({ ...whereFilters, [tenantKey]: tenantId } as unknown as TWhere)
        : whereFilters;
    const ob = typeof orderBy === "function" ? orderBy(f) : orderBy;

    const [total, rows] = await Promise.all([
      delegate.count({ where }),
      delegate.findMany({
        where,
        ...(ob ? { orderBy: ob } : {}),
        skip: (f.page - 1) * f.pageSize,
        take: f.pageSize,
        ...(select ? { select } : {}),
      }),
    ]);

    return {
      data: (rows as TRow[]).map(mapRow),
      total,
      totalPages: Math.ceil(total / f.pageSize),
    };
  }

  async function getById(tenantIdOrId: string, maybeId?: string): Promise<TPublic | null> {
    // Support signatures: getById(id) OR getById(tenantId, id)
    const hasTenant = typeof maybeId === "string";
    const id = hasTenant ? (maybeId as string) : (tenantIdOrId as string);
    const tenantId = hasTenant ? (tenantIdOrId as string) : undefined;

    const where = {
      [idKey]: id,
      ...(tenantId && tenantKey ? { [tenantKey]: tenantId } : {}),
    } as unknown as TWhere;

    const row = await delegate.findFirst({
      where,
      ...(select ? { select } : {}),
    });

    return row ? mapRow(row as TRow) : null;
  }

  async function listLite(tenantIdOrFilters: string | TFilters | unknown, maybeFilters?: unknown): Promise<TLite[]> {
    if (!lite) {
      throw new Error("Lite list is not configured for this resource. Provide opts.lite to enable it.");
    }
    const {
      select: liteSelect,
      mapLite,
      defaultLimit = 20,
      maxLimit = 50,
      orderBy: liteOrderBy,
    } = lite;

    const hasTenant = typeof tenantIdOrFilters === "string";
    const tenantId = hasTenant ? (tenantIdOrFilters as string) : undefined;
    const rawFilters = hasTenant ? maybeFilters : tenantIdOrFilters;

    const f = filterSchema.parse(rawFilters);
    const whereFilters = buildWhere(f, tenantId);
    const where =
      tenantId && tenantKey
        ? ({ ...whereFilters, [tenantKey]: tenantId } as unknown as TWhere)
        : whereFilters;

    // Derive limit safely from filters if they include pageSize; otherwise use default
    const requested = (f as any).pageSize ?? defaultLimit;
    const limit = Math.max(1, Math.min(requested, maxLimit));

    const ob = typeof liteOrderBy === "function" ? liteOrderBy(f) : liteOrderBy;

    const raw = await delegate.findMany({
      where,
      ...(ob ? { orderBy: ob } : {}),
      take: limit,
      ...(liteSelect ? { select: liteSelect as any } : {}),
    });

    // Default mapper tries to build { value: id, label: (name || id) }
    const defaultLiteMap = (r: any): any => ({
      value: String(r?.id ?? r?.value ?? ""),
      label: String(r?.name ?? r?.label ?? r?.id ?? ""),
    });
    
    const rows = raw as unknown as TLiteRow[];
    const projector = (mapLite ?? defaultLiteMap) as (row: TLiteRow) => TLite;
    return (rows as TLiteRow[]).map(projector);
  }

  return { list, getById, listLite };
}
