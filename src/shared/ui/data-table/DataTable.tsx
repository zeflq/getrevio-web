"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  VisibilityState,
  OnChangeFn,
  Updater,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";

export type DataTableMode = "client" | "server";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  /** Client mode: pass entire dataset; Server mode: pass the current page rows */
  data: TData[];
  mode?: DataTableMode;

  /** Toolbar */
  searchKey?: string; // column accessorKey to filter on
  searchPlaceholder?: string;
  renderToolbarExtras?: React.ReactNode;
  /** Provide a custom toolbar node; when set, built-in toolbar is skipped */
  renderToolbar?: React.ReactNode;

  /** Loading / empty */
  isLoading?: boolean;
  emptyText?: string;

  /** Server-mode controls */
  pageCount?: number; // total page count from server
  totalRowsLabel?: string; // e.g., "120 merchants"
  state?: {
    pageIndex?: number;
    pageSize?: number;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    rowSelection?: RowSelectionState;
    columnVisibility?: VisibilityState;
  };
  onPageChange?: (updater: PaginationState) => void;
  onSortingChange?: OnChangeFn<SortingState>;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  mode = "client",

  searchKey,
  searchPlaceholder = "Search...",
  renderToolbarExtras,
  renderToolbar,

  isLoading,
  emptyText = "No results.",

  pageCount,
  totalRowsLabel,
  state,
  onPageChange,
  onSortingChange,
  onColumnFiltersChange,
  onRowSelectionChange,
  onColumnVisibilityChange,
}: DataTableProps<TData, TValue>) {
  // Local state fallbacks for client mode (or when not controlled)
  const [sorting, setSorting] = React.useState<SortingState>(state?.sorting ?? []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    state?.columnFilters ?? []
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: state?.pageIndex ?? 0,
    pageSize: state?.pageSize ?? 10,
  });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    state?.rowSelection ?? {}
  );
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    state?.columnVisibility ?? {}
  );

  // Helpers to read current state (controlled vs local) when we need the value
  const curSorting = mode === "server" ? state?.sorting ?? [] : sorting;
  const curFilters = mode === "server" ? state?.columnFilters ?? [] : columnFilters;
  const curPagination =
    mode === "server"
      ? { pageIndex: state?.pageIndex ?? 0, pageSize: state?.pageSize ?? 10 }
      : pagination;
  const curRowSelection = state?.rowSelection ?? rowSelection;
  const curVisibility = state?.columnVisibility ?? columnVisibility;

  // Updaters: forward to parent in server mode, otherwise local setState
  const handleSortingChange: OnChangeFn<SortingState> =
    onSortingChange ?? ((up) => setSorting(applyUpdater(up, curSorting)));
  const handleFiltersChange: OnChangeFn<ColumnFiltersState> =
    onColumnFiltersChange ?? ((up) => setColumnFilters(applyUpdater(up, curFilters)));
  const handleRowSelChange: OnChangeFn<RowSelectionState> =
    onRowSelectionChange ?? ((up) => setRowSelection(applyUpdater(up, curRowSelection)));
  const handleVisibilityChange: OnChangeFn<VisibilityState> =
    onColumnVisibilityChange ?? ((up) => setColumnVisibility(applyUpdater(up, curVisibility)));

  const handlePaginationChange = (up: Updater<PaginationState> | PaginationState) => {
    const next =
      typeof up === "function" ? (up as (old: PaginationState) => PaginationState)(curPagination) : up;
    if (mode === "server") {
      onPageChange?.(next);
    } else {
      setPagination(next);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: curSorting,
      columnFilters: curFilters,
      pagination: curPagination,
      rowSelection: curRowSelection,
      columnVisibility: curVisibility,
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleFiltersChange,
    onRowSelectionChange: handleRowSelChange,
    onColumnVisibilityChange: handleVisibilityChange,
    onPaginationChange: handlePaginationChange,

    getCoreRowModel: getCoreRowModel(),
    ...(mode === "client"
      ? {
          getFilteredRowModel: getFilteredRowModel(),
          getSortedRowModel: getSortedRowModel(),
        }
      : {
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          pageCount: pageCount ?? -1, // -1 -> unknown
        }),
  });

  return (
    <div className="space-y-4">
      {renderToolbar ? (
        renderToolbar
      ) : (
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          placeholder={searchPlaceholder}
          extras={renderToolbarExtras}
          serverMode={mode === "server"}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        serverMode={mode === "server"}
        totalRowsLabel={totalRowsLabel}
      />
    </div>
  );
}

/** Apply TanStack Updater to a value (works with value or fn) */
function applyUpdater<S>(updater: Updater<S> | S, prev: S): S {
  return typeof updater === "function" ? (updater as (old: S) => S)(prev) : updater;
}