// src/hooks/createCrudBridge.ts
import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import type { LiteListe } from "@/types/lists";

export type ListEnvelope<T> = { data: T[]; total: number; totalPages: number };

type ActionHookOptions<I = any, R = any> = {
  onSuccess?: (args: { data: R; input: I }) => void;
  onError?: (args: { error: unknown; input: I }) => void;
  extraInvalidateKeys?: QueryKey[];
  [k: string]: any;
};

export function createCrudBridge<
  TEntity,
  TId extends string | number = string,
  TLite = LiteListe
>(opts: {
  keyBase: QueryKey;

  // READS (REST)
  list?: (params: Record<string, any>) => Promise<ListEnvelope<TEntity> | TEntity[]>;
  get?: (id: TId) => Promise<TEntity>;
  /** NEW: dedicated lite fetcher (server returns TLite[] already) */
  liteList?: (params: Record<string, any>) => Promise<TLite[]>;

  // WRITES (Server Actions only)
  actions?: {
    create?: (...args: any[]) => Promise<any>;
    update?: (...args: any[]) => Promise<any>;
    remove?: (...args: any[]) => Promise<any>;
  };

  getIdFromActionInput?: (input: any) => TId | undefined;
  getIdFromActionResult?: (result: any) => TId | undefined;

  staleTimeMs?: number;
}) {
  const {
    keyBase,
    list,
    get,
    liteList,
    actions,
    getIdFromActionInput,
    getIdFromActionResult,
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

  // -------- WRITES via Server Actions --------
  const useCreateAction = actions?.create
    ? <I = any, R = any>(options?: ActionHookOptions<I, R>) => {
        const qc = useQueryClient();
        const { onSuccess, onError, extraInvalidateKeys, ...rest } = options ?? {};
        return useAction(actions.create!, {
          ...rest,
          onSuccess: (args: { data: R; input: unknown }) => {
            qc.invalidateQueries({ queryKey: [...keyBase, "list"] });
            qc.invalidateQueries({ queryKey: [...keyBase, "lite"] });
            extraInvalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
            onSuccess?.({ data: args.data, input: args.input as I });
          },
          onError: (args: { error: unknown; input: unknown }) => {
            onError?.({ error: args.error, input: args.input as I });
          },
        });
      }
    : undefined;

  const useUpdateAction = actions?.update
    ? <I = any, R = any>(options?: ActionHookOptions<I, R>) => {
        const qc = useQueryClient();
        const { onSuccess, onError, extraInvalidateKeys, ...rest } = options ?? {};
        return useAction(actions.update!, {
          ...rest,
          onSuccess: (args: { data: R; input: unknown }) => {
            qc.invalidateQueries({ queryKey: [...keyBase, "list"] });
            qc.invalidateQueries({ queryKey: [...keyBase, "lite"] });

            const id =
              (getIdFromActionInput?.(args.input) ??
                getIdFromActionResult?.(args.data)) as TId | undefined;
            if (id !== undefined) {
              qc.invalidateQueries({ queryKey: [...keyBase, "item", id] });
            }

            extraInvalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
            onSuccess?.({ data: args.data, input: args.input as I });
          },
          onError: (args: { error: unknown; input: unknown }) => {
            onError?.({ error: args.error, input: args.input as I });
          },
        });
      }
    : undefined;

  const useRemoveAction = actions?.remove
    ? <I = any, R = any>(options?: ActionHookOptions<I, R>) => {
        const qc = useQueryClient();
        const { onSuccess, onError, extraInvalidateKeys, ...rest } = options ?? {};
        return useAction(actions.remove!, {
          ...rest,
          onSuccess: (args: { data: R; input: unknown }) => {
            qc.invalidateQueries({ queryKey: [...keyBase, "list"] });
            qc.invalidateQueries({ queryKey: [...keyBase, "lite"] });

            const id =
              (getIdFromActionInput?.(args.input) ??
                getIdFromActionResult?.(args.data)) as TId | undefined;
            if (id !== undefined) {
							const itemKey = [...keyBase, "item", id] as QueryKey;
							// stop any in-flight fetch for this item
							qc.cancelQueries({ queryKey: itemKey });
							// remove the item query from cache (prevents refetch → 404)
							qc.removeQueries({ queryKey: itemKey, exact: true });
            }

            extraInvalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
            onSuccess?.({ data: args.data, input: args.input as I });
          },
          onError: (args: { error: unknown; input: unknown }) => {
            onError?.({ error: args.error, input: args.input as I });
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
    useCreateAction,
    useUpdateAction,
    useRemoveAction,
  };
}
