"use client";

import * as React from "react";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbarBase } from "./DataTableToolbarBase";
import { Skeleton } from "@/components/ui/skeleton";

// Keep synced with your controller or import the type.
type DataTableColumnMeta = {
  forTable?: boolean;
  forCard?: boolean;
  headerText?: string;
};

type ControllerShape<TData> = {
  table: Table<TData>;
  mode: "client" | "server";
  thPad: string;
  tdPad: string;
};

export type DataTableClasses = {
  container?: string;   // outer wrapper (around toolbar + list + pagination)
  headerCell?: string;  // applied to the card title wrapper
  bodyCell?: string;    // applied to each meta "cell" block
};

type Props<TData> = {
  controller: ControllerShape<TData>;
  /** Toolbar override */
  toolbar?: React.ReactNode;
  searchKey?: string;
  searchPlaceholder?: string;
  leftExtras?: React.ReactNode;
  rightExtras?: React.ReactNode;
  /** UI / data states */
  isLoading?: boolean;
  emptyText?: string;
  serverTotalRowsLabel?: string;
  /** Card behavior */
  onRowClick?: (id: string, row: TData) => void;
  metaColsPerRow?: 1 | 2;
  primaryColumnId?: string;
  /** Styling hooks */
  classes?: DataTableClasses;
  rowClassName?: (row: Row<TData>) => string | undefined;
  /** Id de la colonne d'action à utiliser (par défaut: actions) */
  actionsColumnId?: string;
};

export function DataTableCards<TData>({
  controller,
  toolbar,
  searchKey,
  searchPlaceholder = "Search...",
  leftExtras,
  rightExtras,
  isLoading,
  emptyText = "No results.",
  serverTotalRowsLabel,
  onRowClick,
  metaColsPerRow = 2,
  primaryColumnId,
  classes,
  actionsColumnId = "actions",
  rowClassName,
}: Props<TData>) {
  const { table, mode } = controller;

  // Only render columns that are NOT table-only
  const isForCard = React.useCallback(
    (colId: string) => {
      const col = table.getAllLeafColumns().find((c) => c.id === colId);
      const meta = col?.columnDef.meta as DataTableColumnMeta | undefined;
      return !meta?.forTable;
    },
    [table]
  );

  // Trouve la colonne d'action par id (par défaut: actions)
  const actionsCardCol = React.useMemo(
    () => table.getAllLeafColumns().find((c) => c.id === actionsColumnId) ?? null,
    [table, actionsColumnId]
  );

  // Resolve a human label for a column id (uses header render → text fallback)
  const headerLabel = React.useCallback(
    (colId: string): string => {
      const col = table.getAllLeafColumns().find((c) => c.id === colId);
      if (!col) return colId;

      try {
        // Try to find a matching header context for this column
        const hg = table.getHeaderGroups()?.[0];
        const header = hg?.headers.find((h) => h.column.id === colId);
        const rendered = header ? flexRender(col.columnDef.header, header.getContext()) : null;
        if (typeof rendered === "string") return rendered;
      } catch {
        // ignore and fall back below
      }

      const meta = col.columnDef.meta as DataTableColumnMeta | undefined;
      return meta?.headerText || colId;
    },
    [table]
  );

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

      <div className="space-y-3">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-1">
            {Array.from({ length: table.getState().pagination.pageSize || 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-1/2 rounded font-medium" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
                <div className="mt-3 grid gap-3 grid-cols-2">
                  {Array.from({ length: metaColsPerRow * 2 }).map((_, j) => (
                    <div key={j} className="min-w-0 text-sm">
                      <div className="text-xs font-medium text-muted-foreground">
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const visible = row.getVisibleCells().filter((c) => isForCard(c.column.id));

            // Choose primary/title cell
            const primary =
              (primaryColumnId && visible.find((c) => c.column.id === primaryColumnId)) ||
              visible[0];

            // The row’s actions menu content
            const actionsCell = actionsCardCol
              ? row.getAllCells().find((c) => c.column.id === actionsCardCol.id)
              : undefined;

            // Meta cells (exclude title + actions)
            const metaCells = visible.filter(
              (c) =>
                c.id !== primary?.id &&
                (!actionsCell || c.id !== actionsCell.id)
            );

            // Ajout du calcul de la classe personnalisée pour la card
            const extraClass = rowClassName ? rowClassName(row) : "";

            return (
              <Card
                key={row.id}
                className={["p-2", extraClass].filter(Boolean).join(" ")}
                role={onRowClick ? "button" : undefined}
                onClick={() => {
                  if (!onRowClick) return;
                  const id = (row.original as { id?: string }).id;
                  if (id) onRowClick(id, row.original);
                }}
              >
                {/* Header: title + actions */}
                <div className="flex items-start justify-between">
                  <div className={["text-base font-medium", classes?.headerCell].filter(Boolean).join(" ")}>
                    {primary &&
                      flexRender(primary.column.columnDef.cell, primary.getContext())}
                  </div>

                  {actionsCell && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {
                        flexRender(actionsCell.column.columnDef.cell,actionsCell.getContext())
                      }
                    </div>)
                  }
                </div>
                
                {/* Meta grid with LABEL + VALUE */}
                {metaCells.length > 0 && (
                  <div
                    className={`mt-3 grid gap-3 ${
                      metaColsPerRow === 1 ? "grid-cols-1" : "grid-cols-2"
                    }`}
                  >
                    {metaCells.map((cell) => (
                      <div
                        key={cell.id}
                        className={["min-w-0 text-sm", classes?.bodyCell].filter(Boolean).join(" ")}
                      >
                        <div className="text-xs font-medium text-muted-foreground">
                          {headerLabel(cell.column.id)}
                        </div>
                        <div className="mt-1 truncate">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="p-6 text-center text-sm text-muted-foreground">{emptyText}</Card>
        )}
      </div>

      <DataTablePagination
        table={table}
        serverMode={mode === "server"}
        totalRowsLabel={serverTotalRowsLabel}
      />
    </div>
  );
}
