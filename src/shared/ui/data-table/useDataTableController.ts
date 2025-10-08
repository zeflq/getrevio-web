"use client";

import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  VisibilityState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";

export type DataTableMode = "client" | "server";

export type DataTableControllerState = {
  pageIndex?: number;
  pageSize?: number;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  rowSelection?: RowSelectionState;
  columnVisibility?: VisibilityState;
};

export type DataTableClasses = {
  /** outer wrapper (around header+list+pagination) */
  container?: string;
  /** th / label cell */
  headerCell?: string;
  /** td / content cell */
  bodyCell?: string;
};

export type UseDataTableControllerArgs<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  mode?: DataTableMode;
  pageCount?: number;

  /** controlled state (server) or initial values (client) */
  state?: DataTableControllerState;

  /** callbacks for server mode */
  onPageChange?: (next: PaginationState) => void;
  onSortingChange?: OnChangeFn<SortingState>;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;

  /** utility */
  excludeColumnIds?: string[];
  density?: "comfortable" | "compact";
};

export function useDataTableController<TData, TValue>({
  columns,
  data,
  mode = "client",
  pageCount,
  state,
  onPageChange,
  onSortingChange,
  onColumnFiltersChange,
  onRowSelectionChange,
  onColumnVisibilityChange,
  excludeColumnIds = [],
  density = "compact",
}: UseDataTableControllerArgs<TData, TValue>) {
  // ----- internal state fallbacks (client mode)
  const [sorting, setSorting] = React.useState<SortingState>(state?.sorting ?? []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(state?.columnFilters ?? []);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: state?.pageIndex ?? 0,
    pageSize: state?.pageSize ?? 10,
  });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(state?.rowSelection ?? {});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(state?.columnVisibility ?? {});

  const curSorting = mode === "server" ? state?.sorting ?? [] : sorting;
  const curFilters = mode === "server" ? state?.columnFilters ?? [] : columnFilters;
  const curPagination =
    mode === "server"
      ? { pageIndex: state?.pageIndex ?? 0, pageSize: state?.pageSize ?? 10 }
      : pagination;
  const curRowSelection = state?.rowSelection ?? rowSelection;
  const curVisibility = state?.columnVisibility ?? columnVisibility;

  // enforce excluded visibility
  const excludedVisibility = React.useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const id of excludeColumnIds) map[id] = false;
    return map;
  }, [excludeColumnIds]);

  const computedVisibility = React.useMemo(
    () => ({ ...curVisibility, ...excludedVisibility }),
    [curVisibility, excludedVisibility]
  );

  // helpers
  const apply = <S,>(updater: Updater<S> | S, prev: S): S =>
    typeof updater === "function" ? (updater as (o: S) => S)(prev) : updater;

  const handleSortingChange: OnChangeFn<SortingState> =
    onSortingChange ?? ((up) => setSorting(apply(up, curSorting)));
  const handleFiltersChange: OnChangeFn<ColumnFiltersState> =
    onColumnFiltersChange ?? ((up) => setColumnFilters(apply(up, curFilters)));
  const handleRowSelChange: OnChangeFn<RowSelectionState> =
    onRowSelectionChange ?? ((up) => setRowSelection(apply(up, curRowSelection)));
  const handleVisibilityChange: OnChangeFn<VisibilityState> =
    onColumnVisibilityChange ??
    ((up) => {
      const next = apply(up, computedVisibility);
      excludeColumnIds.forEach((id) => (next[id] = false));
      setColumnVisibility(next);
    });

  const handlePaginationChange = (up: Updater<PaginationState> | PaginationState) => {
    const next = typeof up === "function" ? (up as (o: PaginationState) => PaginationState)(curPagination) : up;
    if (mode === "server") onPageChange?.(next);
    else setPagination(next);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: curSorting,
      columnFilters: curFilters,
      pagination: curPagination,
      rowSelection: curRowSelection,
      columnVisibility: computedVisibility,
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleFiltersChange,
    onRowSelectionChange: handleRowSelChange,
    onColumnVisibilityChange: handleVisibilityChange,
    onPaginationChange: handlePaginationChange,

    getCoreRowModel: getCoreRowModel(),
    ...(mode === "client"
      ? { getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel() }
      : { manualPagination: true, manualSorting: true, manualFiltering: true, pageCount: pageCount ?? -1 }),
  });

  const tdPad = density === "compact" ? "py-2" : "py-3";
  const thPad = density === "compact" ? "py-2" : "py-3";

  return {
    table,
    mode,
    density,
    tdPad,
    thPad,
  };
}
