// createCrudHooks.ts
import { QueryKey, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

type ListEnvelope<T> = { data: T[]; total: number; totalPages: number };

export function createCrudHooks<
  T,
  Id extends string | number = string,
  L = T
>(opts: {
  keyBase: QueryKey;
  list?: (params: Record<string, string | number>) => Promise<ListEnvelope<T>>;
  get?: (id: Id) => Promise<T>;
  create?: (input: Partial<T>) => Promise<T>;
  update?: (id: Id, input: Partial<T>) => Promise<T>;
  remove?: (id: Id) => Promise<{ success: boolean }>;
  staleTimeMs?: number;
  lite?: {
    map?: (item: T) => L;
    paramKey?: string;
    defaultLimit?: number;
  };
}) {
  const { keyBase, list, get, create, update, remove, staleTimeMs = 60_000, lite } = opts;

  // OLD useList (unchanged)
  const useList = list
    ? (params: Record<string, string | number>) =>
        useQuery({
          queryKey: [...keyBase, "list", params],
          queryFn: () => list(params),
          staleTime: staleTimeMs,
        })
    : undefined;

  const useLite = list && lite
    ? (params: Record<string, string | number> = {}, options?: { enabled?: boolean }) => {
        const map = lite.map ?? ((x: T) => x as unknown as L);
        const paramKey = lite.paramKey ?? "_lite";
        const defaultLimit = lite.defaultLimit ?? 20;

        const mergedParams = {
          ...params,
          [paramKey]: true,
          _limit: params._limit ?? defaultLimit,
        };
        return useQuery<L[]>({
          // mergedParams already contains _lite=true, so key is distinct
          queryKey: [...keyBase, "list", mergedParams],
          queryFn: async () => {
            const res = await list(mergedParams);
            const arr = Array.isArray(res) ? res : res?.data ?? []; // <-- fix 2: array vs envelope
            return (arr as T[]).map(map);
          },
          staleTime: staleTimeMs,
          refetchOnWindowFocus: false,
          enabled: options?.enabled ?? true,
        });
      }
    : undefined;

  const useItem = get
    ? (id?: Id) =>
        useQuery({
          queryKey: [...keyBase, "item", id],
          queryFn: () => get(id as Id),
          enabled: !!id,
          staleTime: staleTimeMs,
        })
    : undefined;

  const useCreate = create
    ? () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: (input: Partial<T>) => create(input),
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: [...keyBase, "list"] });
          },
        });
      }
    : undefined;

  const useUpdate = update
    ? () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: (v: { id: Id; input: Partial<T> }) => update(v.id, v.input),
          onSuccess: (_d, v) => {
            qc.invalidateQueries({ queryKey: [...keyBase, "list"] });
            qc.invalidateQueries({ queryKey: [...keyBase, "item", v.id] });
          },
        });
      }
    : undefined;

  const useRemove = remove
    ? () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: (id: Id) => remove(id),
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: [...keyBase, "list"] });
          },
        });
      }
    : undefined;

  return { useList, useLite, useItem, useCreate, useUpdate, useRemove };
}
