import type { SortPolicy } from "../queries/createServerQueries";

export function makeSortPolicy<F>(opts: {
  allowed: readonly string[];
  defaultKey: string;
  defaultDir?: "asc" | "desc";
  map?: (key: string) => string;
}): SortPolicy<F> {
  const defaultDir = opts.defaultDir ?? "desc";
  return {
    allowed: opts.allowed,
    defaultKey: opts.defaultKey,
    defaultDir,
    toOrderBy: (key, dir, _filters) => {
      const safeKey = opts.allowed.includes(key) ? key : opts.defaultKey;
      const field = opts.map ? opts.map(safeKey) : safeKey;
      return { [field]: dir ?? defaultDir };
    },
  };
}

export const createdAtDescSort = makeSortPolicy<{ sort?: string; dir?: "asc" | "desc" }>({
  allowed: ["createdAt"],
  defaultKey: "createdAt",
  defaultDir: "desc",
});
