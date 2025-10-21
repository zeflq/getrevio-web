// src/server/core/actions/createServerActions.ts
"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

/** Repo CRUD minimal pour les actions */
export interface CrudRepo<TRow, TWhere, TSelect, TCreate, TUpdate> {
  create(args: { data: TCreate; select?: TSelect }): Promise<TRow>;
  update(args: { where: TWhere; data: TUpdate; select?: TSelect }): Promise<TRow>;
  delete(args: { where: TWhere }): Promise<void>;
  findFirst(args: { where: TWhere; select?: TSelect }): Promise<TRow | null>;
}

/** Contexte d'action (injecté par le client safe) */
export type ActionContext = {
  user?: { id: string; tenantId?: string; roles?: string[]; email?: string } | null;
};

/**
 * Client compatible: on ne fige PAS la signature exacte de next-safe-action.
 * On exige seulement .schema(schema).action(handler) qui retourne une Server Action (fonction).
 * Cela évite les incompatibilités de types entre versions/overloads.
 */
export type CompatibleSafeClient = {
  schema: (schema: z.ZodTypeAny) => {
    // L’impl réel (NSA) accepte (serverCodeFn, utils?). On accepte "any" ici et on normalise en interne.
    action: (...args: any[]) => (input: any) => Promise<any>;
  };
};

/** I/O exposés publics: basés sur les schémas */
export type CreateServerActionsReturn<
  TRow,
  TWhere,
  TSelect,
  TCreateSchema extends z.ZodTypeAny,
  TUpdateSchema extends z.ZodTypeAny,
  TDeleteSchema extends z.ZodTypeAny
> = {
  createAction: (input: z.output<TCreateSchema>) => Promise<TRow>;
  updateAction: (input: z.output<TUpdateSchema>) => Promise<TRow>;
  deleteAction: (input: z.output<TDeleteSchema>) => Promise<{ ok: true }>;
};

type DeletePayload = { id: string };

/** Adapteur interne: normalise l’appel .schema(schema).action(handler) */
function buildAction<TSchema extends z.ZodTypeAny, TResult>(
  safe: CompatibleSafeClient,
  schema: TSchema,
  impl: (args: { parsedInput: z.output<TSchema>; ctx: ActionContext }) => Promise<TResult>
): (input: z.output<TSchema>) => Promise<TResult> {
  const factory = safe.schema(schema);

  // Handler universel : NSA fournit { parsedInput, ctx, ... }, d'autres libs peuvent fournir juste parsedInput.
  const universalHandler = async (args: any) => {
    // Essaye d’extraire parsedInput/ctx selon les conventions NSA
    const parsedInput =
      args?.parsedInput !== undefined ? args.parsedInput : args?.input ?? args;
    const ctx: ActionContext =
      (args?.ctx as ActionContext) ??
      (args?.serverCtx as ActionContext) ??
      {};

    return impl({ parsedInput, ctx });
  };

  // Certains clients: action(handler), d’autres: action(handler, utils)
  const actionFn = (factory as any).action(universalHandler);
  // Normalise en (input) => Promise<TResult>
  return actionFn as (input: z.output<TSchema>) => Promise<TResult>;
}

/**
 * Fabrique d’actions serveur (safe-only) :
 * - validation via schémas Zod (portée par le client safe)
 * - multi-tenant (scoping + stamp tenant à la création)
 * - hooks beforeCreate/beforeUpdate
 * - revalidation de tags next/cache
 */
export async function  createServerActions<
  TRow,
  TWhere,
  TSelect,
  // Types “domaine” pour le repo (payload DB)
  TCreateData extends Record<string, any>,
  TUpdateData extends Record<string, any>,
  // Schémas d’I/O exposés publiquement
  TCreateSchema extends z.ZodTypeAny,
  TUpdateSchema extends z.ZodTypeAny, // inclut id
  TDeleteSchema extends z.ZodTypeAny   // { id }
>(opts: {
  /** Client d’actions safe-only (next-safe-action ou équivalent) */
  actionClient: CompatibleSafeClient;

  /** Data-access (CRUD) */
  repo: CrudRepo<TRow, TWhere, TSelect, TCreateData, TUpdateData>;

  /** Construit le where id + tenant */
  whereByIdTenant: (id: string, tenantId?: string) => TWhere;

  /** Schémas de validation (utilisés par le client safe) */
  createSchema: TCreateSchema;
  updateSchema: TUpdateSchema; // doit contenir id
  deleteSchema: TDeleteSchema; // { id }

  /** Multi-tenant */
  getTenantId?: (ctx: ActionContext) => string | undefined;
  /** Clé tenant à stamper en create si présent (par défaut: "tenantId") */
  tenantKey?: string;

  /** next/cache revalidation */
  revalidateTag?: string | string[];

  /** Projections après écriture */
  selectAfterCreate?: TSelect;
  selectAfterUpdate?: TSelect;

  /** Hooks (sur l'input exposé, avant cast vers payload DB) */
  beforeCreate?: (
    input: z.output<TCreateSchema>,
    ctx: ActionContext
  ) => Promise<z.output<TCreateSchema>> | z.output<TCreateSchema>;

  beforeUpdate?: (
    id: string,
    patch: Omit<z.output<TUpdateSchema>, "id">,
    ctx: ActionContext
  ) => Promise<Omit<z.output<TUpdateSchema>, "id">> | Omit<z.output<TUpdateSchema>, "id">;

  /** Optional hooks that run after persistence */
  afterCreate?: (
    args: {
      record: TRow;
      input: z.output<TCreateSchema>;
      ctx: ActionContext;
    }
  ) => Promise<void> | void;

  afterUpdate?: (
    args: {
      id: string;
      previous: TRow | null | undefined;
      inputPatch: Omit<z.output<TUpdateSchema>, "id">;
      record: TRow;
      ctx: ActionContext;
    }
  ) => Promise<void> | void;

  afterDelete?: (
    args: {
      id: string;
      previous: TRow | null | undefined;
      ctx: ActionContext;
    }
  ) => Promise<void> | void;

  /** Optional helper for fetching a row prior to update/delete hooks */
  getById?: (id: string, tenantId?: string) => Promise<TRow | null>;
}): Promise<CreateServerActionsReturn<
  TRow,
  TWhere,
  TSelect,
  TCreateSchema,
  TUpdateSchema,
  TDeleteSchema
>> {
  const {
    actionClient,
    repo,
    whereByIdTenant,
    createSchema,
    updateSchema,
    deleteSchema,
    getTenantId = (ctx) => ctx.user?.tenantId,
    tenantKey = "tenantId",
    revalidateTag: tag,
    selectAfterCreate,
    selectAfterUpdate,
    beforeCreate,
    beforeUpdate,
    afterCreate,
    afterUpdate,
    afterDelete,
    getById,
  } = opts;

  const revalidate = () => {
    if (!tag) return;
    const tags = Array.isArray(tag) ? tag : [tag];
    for (const t of tags) revalidateTag(t);
  };

  // CREATE
  const createAction = buildAction(actionClient, createSchema, async ({ parsedInput, ctx }) => {
    const tenantId = getTenantId(ctx);

    // Stamp tenant sur l’input public
    const stamped =
      tenantId && typeof parsedInput === "object" && parsedInput !== null
        ? ({ ...(parsedInput as Record<string, unknown>), [tenantKey]: tenantId } as z.output<TCreateSchema>)
        : parsedInput;

    const prepared = beforeCreate ? await beforeCreate(stamped, ctx) : stamped;

    // Cast vers payload DB
    const toCreate = prepared as unknown as TCreateData;

    const row = await repo.create({ data: toCreate, select: selectAfterCreate });
    await afterCreate?.({ record: row, input: prepared, ctx });
    revalidate();
    return row;
  });

  // UPDATE (le schema inclut id)
  const updateAction = buildAction(actionClient, updateSchema, async ({ parsedInput, ctx }) => {
    const { id, ...patch } = parsedInput as { id: string } & Record<string, unknown>;

    const tenantId = getTenantId(ctx);
    const where = whereByIdTenant(id, tenantId);

    // Défense en profondeur
    let previous: TRow | null | undefined;
    if (tenantId) {
      previous = await (getById ? getById(id, tenantId) : repo.findFirst({ where }));
      if (!previous) throw new Error("Resource not found or not accessible");
    } else if (getById) {
      previous = await getById(id);
    }
    if (!previous && !getById) {
      previous = await repo.findFirst({ where });
    }

    const finalPatchRaw = beforeUpdate
      ? await beforeUpdate(id, patch as any, ctx)
      : (patch as any);

    const data = finalPatchRaw as unknown as TUpdateData;

    const row = await repo.update({ where, data, select: selectAfterUpdate });
    await afterUpdate?.({ id, previous, inputPatch: finalPatchRaw as Omit<z.output<TUpdateSchema>, "id">, record: row, ctx });
    revalidate();
    return row;
  });

  // DELETE
  const deleteAction = buildAction(actionClient, deleteSchema, async ({ parsedInput, ctx }) => {
    const { id } = parsedInput as DeletePayload;

    const tenantId = getTenantId(ctx);
    const where = whereByIdTenant(id, tenantId);

    let previous: TRow | null | undefined;
    if (tenantId) {
      previous = await (getById ? getById(id, tenantId) : repo.findFirst({ where }));
      if (!previous) throw new Error("Resource not found or not accessible");
    } else {
      previous = await (getById ? getById(id) : repo.findFirst({ where }));
      if (!previous) throw new Error("Resource not found or not accessible");
    }

    await repo.delete({ where });
    await afterDelete?.({ id, previous, ctx });
    revalidate();
    return { ok: true } as const;
  });

  return { createAction, updateAction, deleteAction };
}
