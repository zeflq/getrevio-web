"use client";

import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbarBase } from "./DataTableToolbarBase";

// Keep this in sync with your controller type or import it directly.
type ControllerShape<TData> = {
  table: import("@tanstack/react-table").Table<TData>;
  mode: "client" | "server";
  thPad: string; // padding class for <th>
  tdPad: string; // padding class for <td>
};

export type DataTableClasses = {
  container?: string;   // outer wrapper
  headerCell?: string;  // th
  bodyCell?: string;    // td
};

type Props<TData> = {
  controller: ControllerShape<TData>;

  /**
   * If provided:
   *  - `toolbar={null}` → no toolbar
   *  - `toolbar={<Custom />}` → render your custom toolbar
   * If omitted, renders <DataTableToolbarBase /> with left/right slots.
   */
  toolbar?: React.ReactNode;

  /** Base toolbar props (used only when toolbar is omitted) */
  searchKey?: string;
  searchPlaceholder?: string;
  leftExtras?: React.ReactNode;
  rightExtras?: React.ReactNode;

  /** UI / data states */
  isLoading?: boolean;
  emptyText?: string;
  stickyHeader?: boolean;

  /** Server-only label like "120 merchants" */
  serverTotalRowsLabel?: string;

  /** Styling hooks */
  classes?: DataTableClasses;
};

export function DataTableTable<TData>({
  controller,
  toolbar,
  searchKey,
  searchPlaceholder = "Search...",
  leftExtras,
  rightExtras,
  isLoading,
  emptyText = "No results.",
  stickyHeader = false,
  serverTotalRowsLabel,
  classes,
}: Props<TData>) {
  const { table, mode, thPad, tdPad } = controller;

  const headerStickyClass = stickyHeader
    ? "sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    : undefined;

  // Only render columns that are NOT card-only
  const isForTable = React.useCallback(
    (colId: string) => {
      const col = table.getAllLeafColumns().find((c) => c.id === colId);
      return !(col?.columnDef as any)?.meta?.forCard;
    },
    [table]
  );

  const colCount = table
    .getAllLeafColumns()
    .filter((c) => isForTable(c.id))
    .length;

  const renderToolbar = () => {
    if (toolbar === null) return null;
    if (toolbar !== undefined) return toolbar;
    return (
      <DataTableToolbarBase
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        leftExtras={leftExtras}
        rightExtras={rightExtras}
        serverMode={mode === "server"}
      />
    );
  };

  return (
    <div className={["space-y-4", classes?.container].filter(Boolean).join(" ")}>
      {renderToolbar()}

      <div className="rounded-lg border bg-background">
        <UiTable className="w-full">
          <TableHeader className={headerStickyClass}>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers
                  .filter((h) => isForTable(h.column.id))
                  .map((h) => (
                    <TableHead key={h.id} className={[thPad, classes?.headerCell].filter(Boolean).join(" ")}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colCount} className="h-24 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/40">
                  {row
                    .getVisibleCells()
                    .filter((cell) => isForTable(cell.column.id))
                    .map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={["align-middle", tdPad, classes?.bodyCell].filter(Boolean).join(" ")}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={colCount} className="h-24 text-center">
                  <span className="text-muted-foreground">{emptyText}</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UiTable>
      </div>

      <DataTablePagination table={table} serverMode={mode === "server"} totalRowsLabel={serverTotalRowsLabel} />
    </div>
  );
}