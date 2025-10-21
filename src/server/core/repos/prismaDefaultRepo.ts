import type {
  CrudRepo,
  CreateArgs,
  DeleteArgs,
  FindFirstArgs,
  FindManyArgs,
  ReadRepo,
  CountArgs,
  UpdateArgs,
} from "./types";

/**
 * Generic Prisma-backed CRUD repo using a delegate (e.g., prisma.merchant).
 * Provide the delegate at construction. Select/Where/Data types remain generic.
 */
export class PrismaDefaultRepo<
  TRow,
  TWhere,
  TSelect,
  TCreate,
  TUpdate
> implements CrudRepo<TRow, TWhere, TSelect, TCreate, TUpdate> {
  constructor(private readonly delegate: any) {}

  count(args: CountArgs<TWhere>) {
    const { signal: _signal, ...rest } = args as CountArgs<TWhere> & { signal?: AbortSignal };
    return this.delegate.count(rest);
  }

  findMany(args: FindManyArgs<TWhere, TSelect>) {
    const { signal: _signal, ...rest } = args as FindManyArgs<TWhere, TSelect> & { signal?: AbortSignal };
    return this.delegate.findMany(rest);
  }

  findFirst(args: FindFirstArgs<TWhere, TSelect>) {
    const { signal: _signal, ...rest } = args as FindFirstArgs<TWhere, TSelect> & { signal?: AbortSignal };
    return this.delegate.findFirst(rest);
  }

  create(args: CreateArgs<TCreate, TSelect>) {
    return this.delegate.create(args);
  }

  update(args: UpdateArgs<TWhere, TUpdate, TSelect>) {
    return this.delegate.update(args);
  }

  delete(args: DeleteArgs<TWhere>) {
    return this.delegate.delete(args).then(() => {});
  }
}
