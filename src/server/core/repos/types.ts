export type CountArgs<TWhere> = {
  where: TWhere;
  signal?: AbortSignal;
};

export type FindManyArgs<TWhere, TSelect> = {
  where: TWhere;
  orderBy?: any;
  skip?: number;
  take?: number;
  select?: TSelect;
  cursor?: any;
  signal?: AbortSignal;
};

export type FindFirstArgs<TWhere, TSelect> = {
  where: TWhere;
  select?: TSelect;
  signal?: AbortSignal;
};

export interface ReadRepo<TRow, TWhere, TSelect> {
  count(args: CountArgs<TWhere>): Promise<number>;
  findMany(args: FindManyArgs<TWhere, TSelect>): Promise<TRow[]>;
  findFirst(args: FindFirstArgs<TWhere, TSelect>): Promise<TRow | null>;
}

export type CreateArgs<TCreate, TSelect> = {
  data: TCreate;
  select?: TSelect;
};

export type UpdateArgs<TWhere, TUpdate, TSelect> = {
  where: TWhere;
  data: TUpdate;
  select?: TSelect;
};

export type DeleteArgs<TWhere> = {
  where: TWhere;
};

export interface CrudRepo<
  TRow,
  TWhere,
  TSelect,
  TCreate,
  TUpdate
> extends ReadRepo<TRow, TWhere, TSelect> {
  create?(args: CreateArgs<TCreate, TSelect>): Promise<TRow>;
  update?(args: UpdateArgs<TWhere, TUpdate, TSelect>): Promise<TRow>;
  delete?(args: DeleteArgs<TWhere>): Promise<void>;
}
