"use server";



import { revalidateTag } from "next/cache";

/**
 * Minimal shape of your next-safe-action client (e.g., actionUser).
 * We keep this loose on purpose to avoid deep generics from the lib.
 */
type SafeActionClient = {
  schema: (schema: any) => {
    action: (
      impl: (args: { parsedInput: any; ctx: any }) => Promise<any>
    ) => any;
  };
};

type PrismaWriteDelegate = {
  create: (args: { data: any; select?: any }) => Promise<any>;
  updateMany: (args: { where: any; data: any }) => Promise<{ count: number }>;
  deleteMany: (args: { where: any }) => Promise<{ count: number }>;
};

/** Optional read method to fetch a single row before update/delete side-effects */
type GetByIdFn<TId> = (id: TId, tenantId?: string) => Promise<any | null>;

export async function createServerActions<
  TCreateInput extends object,
  TUpdateInput extends object,
  TId extends string | number = string
>(opts: {
  /** e.g. actionUser from your auth-safe client */
  actionClient: SafeActionClient;

  /** Prisma model delegate (writes) */
  delegate: PrismaWriteDelegate;

  /** How to scope by id (+ tenant if provided) */
  whereByIdTenant: (id: TId, tenantId?: string) => any;

  /** Zod schemas */
  createSchema: any; // z.ZodType<TCreateInput>
  updateSchema: any; // z.ZodType<{ id: TId } & TUpdateInput>
  deleteSchema: any; // z.ZodType<{ id: TId }>

  /** Pull tenantId (or other ctx props) from the action context */
  getTenantId?: (ctx: any) => string | undefined;

  /** Optional: tag to revalidate after mutations (e.g., "merchants") */
  revalidateTag?: string;

  /** Optional: read function to fetch the current record by id */
  getById?: GetByIdFn<TId>;

  /** Optional hooks for customization */
  beforeCreate?: (input: TCreateInput, ctx: any) => Promise<TCreateInput> | TCreateInput;
  afterCreate?: (args: { record: any; input: TCreateInput; ctx: any }) => Promise<void> | void;

  beforeUpdate?: (
    id: TId,
    patch: TUpdateInput,
    ctx: any
  ) => Promise<TUpdateInput> | TUpdateInput;

  /** New: called after a successful update; receives the previous record (if getById provided) */
  afterUpdate?: (args: {
    id: TId;
    inputPatch: TUpdateInput;
    previous?: any | null;
    ctx: any;
  }) => Promise<void> | void;

  /** Called before delete (business rules) */
  beforeDelete?: (id: TId, ctx: any) => Promise<void> | void;

  /** New: called after a successful delete; receives the deleted record (requires getById) */
  afterDelete?: (args: { id: TId; previous?: any | null; ctx: any }) => Promise<void> | void;

  /** Optional: what to return after create/update/delete */
  selectAfterCreate?: any; // Prisma select
  returnOkOnUpdate?: boolean; // default true
  returnOkOnDelete?: boolean; // default true

  /** Optional: centralized error hook */
  onError?: (err: unknown, meta: { op: "create" | "update" | "delete"; input: any; ctx: any }) => void | Promise<void>;

  /** Field name used when auto-attaching tenant id during create (default: "tenantId") */
  tenantKey?: string;
}) {
  const {
    actionClient,
    delegate,
    whereByIdTenant,
    createSchema,
    updateSchema,
    deleteSchema,
    getTenantId,
    revalidateTag: tag,
    getById,
    beforeCreate,
    afterCreate,
    beforeUpdate,
    afterUpdate,
    beforeDelete,
    afterDelete,
    selectAfterCreate,
    returnOkOnUpdate = true,
    returnOkOnDelete = true,
    onError,
    tenantKey = "tenantId",
  } = opts;

  // CREATE
  const createAction = actionClient
    .schema(createSchema)
    .action(async ({ parsedInput, ctx }: { parsedInput: TCreateInput; ctx: any }) => {
      try {
        const tenantId = getTenantId?.(ctx);
        const data = (await beforeCreate?.(parsedInput, ctx)) ?? parsedInput;

        const record = await delegate.create({
          data: tenantId && tenantKey ? { ...data, [tenantKey]: tenantId } : data,
          ...(selectAfterCreate ? { select: selectAfterCreate } : {}),
        });

        await afterCreate?.({ record, input: data, ctx });
        if (tag) revalidateTag(tag);
        return record;
      } catch (err) {
        await onError?.(err, { op: "create", input: parsedInput, ctx });
        throw err;
      }
    });

  // UPDATE
  const updateAction = actionClient
    .schema(updateSchema)
    .action(
      async ({
        parsedInput,
        ctx,
      }: {
        parsedInput: { id: TId } & TUpdateInput;
        ctx: any;
      }) => {
        try {
          const { id, ...patch } = parsedInput as any;
          const tenantId = getTenantId?.(ctx);
          const guardedWhere = whereByIdTenant(id, tenantId);

          const previous = getById ? await getById(id, tenantId) : undefined;
          const nextPatch =
            (await beforeUpdate?.(id, patch as TUpdateInput, ctx)) ??
            (patch as TUpdateInput);

          const res = await delegate.updateMany({
            where: guardedWhere,
            data: nextPatch,
          });

          if (res.count === 0) {
            throw new Error("NOT_FOUND_OR_FORBIDDEN");
          }

          await afterUpdate?.({ id, inputPatch: nextPatch, previous, ctx });
          if (tag) revalidateTag(tag);
          if (returnOkOnUpdate) return { ok: true, id };
          return { id };
        } catch (err) {
          await onError?.(err, { op: "update", input: parsedInput, ctx });
          throw err;
        }
      }
    );

  // DELETE
  const deleteAction = actionClient
    .schema(deleteSchema)
    .action(async ({ parsedInput, ctx }: { parsedInput: { id: TId }; ctx: any }) => {
      try {
        const { id } = parsedInput;
        const tenantId = getTenantId?.(ctx);

        const previous = getById ? await getById(id, tenantId) : undefined;

        await beforeDelete?.(id, ctx);

        const res = await delegate.deleteMany({
          where: whereByIdTenant(id, tenantId),
        });

        if (res.count === 0) {
          throw new Error("NOT_FOUND_OR_FORBIDDEN");
        }

        await afterDelete?.({ id, previous, ctx });
        if (tag) revalidateTag(tag);
        return returnOkOnDelete ? { ok: true, id } : { id };
      } catch (err) {
        await onError?.(err, { op: "delete", input: parsedInput, ctx });
        throw err;
      }
    });

  return { createAction, updateAction, deleteAction };
}
