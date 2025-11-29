"use client";

import * as React from "react";
import { type Row, type Table } from "@tanstack/react-table";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbarBase } from "./DataTableToolbarBase";
import { DataTableCardRow } from "./DataTableCardRow";

// Meta used on columnDef.meta
export type DataTableColumnMeta = {
  forTable?: boolean;
  forCard?: boolean;
  headerText?: string;
};

// Keep synced with your controller or import the type.
export type ControllerShape<TData> = {
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
  toolbar?: React.ReactNode | null;
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

  const pageSize = table.getState().pagination.pageSize || 6;
  const rows = table.getRowModel().rows ?? [];

  return (
    <div
      className={[
        "space-y-4", // base spacing for toolbar + list + pagination
        classes?.container,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {renderToolbar()}

      <div className="space-y-3">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-1">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Card
                key={i}
                className="border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm p-3 sm:p-4 rounded-2xl"
              >
                {/* header skeleton */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 sm:h-5 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>

                {/* divider */}
                <div className="mt-3 border-t border-border/40" />

                {/* meta skeleton grid */}
                <div
                  className={[
                    "mt-3 grid gap-3",
                    metaColsPerRow === 1
                      ? "grid-cols-1"
                      : "grid-cols-1 sm:grid-cols-2",
                  ].join(" ")}
                >
                  {Array.from({ length: metaColsPerRow * 2 }).map((_, j) => (
                    <div key={j} className="min-w-0 space-y-1 text-sm">
                      <Skeleton className="h-3 w-1/2 rounded" />
                      <Skeleton className="h-4 w-2/3 rounded" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : rows.length ? (
          rows.map((row) => (
            <DataTableCardRow
              key={row.id}
              controller={controller}
              row={row}
              metaColsPerRow={metaColsPerRow}
              primaryColumnId={primaryColumnId}
              classes={classes}
              actionsColumnId={actionsColumnId}
              onRowClick={onRowClick}
              rowClassName={rowClassName}
            />
          ))
        ) : (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            {emptyText}
          </Card>
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
