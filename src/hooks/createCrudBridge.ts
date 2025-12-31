// src/hooks/createCrudBridge.ts
import {
  QueryKey,
  useQuery,
  useQueryClient,
  useMutation,
  UseQueryResult,
} from "@tanstack/react-query";
import type { LiteListe } from "@/types/lists";

export type ListEnvelope<T> = { data: T[]; total: number; totalPages: number };

type MutationHookOptions<I = any, R = any> = {
  onSuccess?: (data: R, input: I) => void;
  onError?: (error: Error, input: I) => void;
  extraInvalidateKeys?: QueryKey[];
};

export function createCrudBridge<
  TEntity,
  TId extends string | number = string,
  TLite = LiteListe
>(opts: {
  keyBase: QueryKey;

  // READS (REST API)
  list?: (params: Record<string, any>) => Promise<ListEnvelope<TEntity> | TEntity[]>;
  get?: (id: TId) => Promise<TEntity>;
  /** NEW: dedicated lite fetcher (server returns TLite[] already) */
  liteList?: (params: Record<string, any>) => Promise<TLite[]>;

  // WRITES (API Mutations) - flattened like reads
  create?: (input: any) => Promise<any>;
  update?: (input: any) => Promise<any>;
  remove?: (input: any) => Promise<any>;

  getIdFromInput?: (input: any) => TId | undefined;
  getIdFromResult?: (result: any) => TId | undefined;

  staleTimeMs?: number;
}) {
  const {
    keyBase,
    list,
    get,
    liteList,
    create,
    update,
    remove,
    getIdFromInput,
    getIdFromResult,
    staleTimeMs = 60_000,
  } = opts;

  // -------- READS --------
  const useList = list
    ? (params: Record<string, any>) =>
        useQuery({
          queryKey: [...keyBase, "list", params],
          queryFn: async () => {
            const res = await list(params);
            if (Array.isArray(res)) {
              return { data: res, total: res.length, totalPages: 1 } as ListEnvelope<TEntity>;
            }
            return res as ListEnvelope<TEntity>;
          },
          staleTime: staleTimeMs,
        }) as UseQueryResult<ListEnvelope<TEntity>>
    : undefined;

  const useItem = get
    ? (id?: TId) =>
        useQuery({
          queryKey: [...keyBase, "item", id],
          queryFn: () => get(id as TId),
          enabled: !!id,
          staleTime: staleTimeMs,
        }) as UseQueryResult<TEntity>
    : undefined;

  /** Lite: directly call the dedicated lite route; server returns TLite[] */
  const useLite =
    liteList
      ? (params: Record<string, any> = {}, options?: { enabled?: boolean; staleTime?: number }) =>
          useQuery<TLite[]>({
            queryKey: [...keyBase, "lite", params],
            queryFn: () => liteList(params),
            staleTime: options?.staleTime ?? staleTimeMs,
            refetchOnWindowFocus: false,
            enabled: options?.enabled ?? true,
          })
      : undefined;

  // -------- WRITES via API Mutations --------
  const useCreateMutation = create
    ? <I = any, R = any>(options?: MutationHookOptions<I, R>) => {
        const qc = useQueryClient();
        const { onSuccess, onError, extraInvalidateKeys } = options ?? {};
        return useMutation({
          mutationFn: (input: I) => create(input),
          onSuccess: (data: R, input: I) => {
            qc.invalidateQueries({ queryKey: [...keyBase, "list"] });
            qc.invalidateQueries({ queryKey: [...keyBase, "lite"] });
            extraInvalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
            onSuccess?.(data, input);
          },
          onError: (error: Error, input: I) => {
            onError?.(error, input);
          },
        });
      }
    : undefined;

  const useUpdateMutation = update
    ? <I = any, R = any>(options?: MutationHookOptions<I, R>) => {
        const qc = useQueryClient();
        const { onSuccess, onError, extraInvalidateKeys } = options ?? {};
        return useMutation({
          mutationFn: (input: I) => update(input),
          onSuccess: (data: R, input: I) => {
            qc.invalidateQueries({ queryKey: [...keyBase, "list"] });
            qc.invalidateQueries({ queryKey: [...keyBase, "lite"] });

            const id =
              (getIdFromInput?.(input) ??
                getIdFromResult?.(data)) as TId | undefined;
            if (id !== undefined) {
              qc.invalidateQueries({ queryKey: [...keyBase, "item", id] });
            }

            extraInvalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
            onSuccess?.(data, input);
          },
          onError: (error: Error, input: I) => {
            onError?.(error, input);
          },
        });
      }
    : undefined;

  const useRemoveMutation = remove
    ? <I = any, R = any>(options?: MutationHookOptions<I, R>) => {
        const qc = useQueryClient();
        const { onSuccess, onError, extraInvalidateKeys } = options ?? {};
        return useMutation({
          mutationFn: (input: I) => remove(input),
          onSuccess: (data: R, input: I) => {
            qc.invalidateQueries({ queryKey: [...keyBase, "list"] });
            qc.invalidateQueries({ queryKey: [...keyBase, "lite"] });

            const id =
              (getIdFromInput?.(input) ??
                getIdFromResult?.(data)) as TId | undefined;
            if (id !== undefined) {
              const itemKey = [...keyBase, "item", id] as QueryKey;
              // stop any in-flight fetch for this item
              qc.cancelQueries({ queryKey: itemKey });
              // remove the item query from cache (prevents refetch → 404)
              qc.removeQueries({ queryKey: itemKey, exact: true });
            }

            extraInvalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
            onSuccess?.(data, input);
          },
          onError: (error: Error, input: I) => {
            onError?.(error, input);
          },
        });
      }
    : undefined;

  return {
    // READS
    useList,
    useItem,
    useLite,

    // WRITES
    useCreateMutation,
    useUpdateMutation,
    useRemoveMutation,
  };
}
