"use client";

import * as React from "react";
import { flexRender, type Row } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

import type {
  ControllerShape,
  DataTableClasses,
  DataTableColumnMeta,
} from "./DataTableCards";

type DataTableCardRowProps<TData> = {
  controller: ControllerShape<TData>;
  row: Row<TData>;
  metaColsPerRow: 1 | 2;
  primaryColumnId?: string;
  classes?: DataTableClasses;
  actionsColumnId: string;
  onRowClick?: (id: string, row: TData) => void;
  rowClassName?: (row: Row<TData>) => string | undefined;
};

export function DataTableCardRow<TData>({
  controller,
  row,
  metaColsPerRow,
  primaryColumnId,
  classes,
  actionsColumnId,
  onRowClick,
  rowClassName,
}: DataTableCardRowProps<TData>) {
  const { table } = controller;
  const isInteractive = Boolean(onRowClick);

  // Only render columns that are NOT table-only
  const isForCard = React.useCallback(
    (colId: string) => {
      const col = table.getAllLeafColumns().find((c) => c.id === colId);
      const meta = col?.columnDef.meta as DataTableColumnMeta | undefined;
      return !meta?.forTable;
    },
    [table]
  );

  const actionsCardCol = React.useMemo(
    () => table.getAllLeafColumns().find((c) => c.id === actionsColumnId) ?? null,
    [table, actionsColumnId]
  );

  const headerLabel = React.useCallback(
    (colId: string): string => {
      const col = table.getAllLeafColumns().find((c) => c.id === colId);
      if (!col) return colId;

      try {
        const hg = table.getHeaderGroups()?.[0];
        const header = hg?.headers.find((h) => h.column.id === colId);
        const rendered = header ? flexRender(col.columnDef.header, header.getContext()) : null;
        if (typeof rendered === "string") return rendered;
      } catch {
        // ignore and fall back
      }

      const meta = col.columnDef.meta as DataTableColumnMeta | undefined;
      return meta?.headerText || colId;
    },
    [table]
  );

  const visible = row.getVisibleCells().filter((c) => isForCard(c.column.id));

  const primary =
    (primaryColumnId && visible.find((c) => c.column.id === primaryColumnId)) ||
    visible[0];

  const actionsCell = actionsCardCol
    ? row.getAllCells().find((c) => c.column.id === actionsCardCol.id)
    : undefined;

  const metaCells = visible.filter(
    (c) =>
      c.id !== primary?.id &&
      (!actionsCell || c.id !== actionsCell.id)
  );

  const extraClass = rowClassName ? rowClassName(row) : "";
  const rowId = (row.original as { id?: string }).id;

  return (
    <Card
      className={[
        "group relative border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm",
        "p-3 sm:p-4 rounded-2xl",
        isInteractive
          ? "cursor-pointer transition-transform transition-shadow hover:-translate-y-[1px] hover:shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
          : "transition-shadow",
        extraClass,
      ]
        .filter(Boolean)
        .join(" ")}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : -1}
      onClick={() => {
        if (!onRowClick || !rowId) return;
        onRowClick(rowId, row.original);
      }}
      onKeyDown={(e) => {
        if (!isInteractive || !rowId) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onRowClick?.(rowId, row.original);
        }
      }}
    >
      {/* Header: perfectly aligned */}
      <div className="flex items-center">
        {/* Title always takes all remaining space */}
        <div className="flex-1 min-w-0">
          <div
            className={[
              "truncate text-sm sm:text-base font-semibold tracking-tight text-foreground",
              classes?.headerCell,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {primary &&
              flexRender(primary.column.columnDef.cell, primary.getContext())}
          </div>
        </div>

        {/* Fixed-width actions cell wrapper */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-8"
        >
          {actionsCell &&
            flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
        </div>

        {/* Fixed-width chevron wrapper */}
        {isInteractive && (
          <div className="flex items-center justify-center w-5 text-muted-foreground/60 group-hover:text-primary/80 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Divider between header & meta */}
      {metaCells.length > 0 && (
        <div className="mt-3 border-t border-border/50" />
      )}

      {/* Meta grid with LABEL + VALUE */}
      {metaCells.length > 0 && (
        <div
          className={[
            "mt-3 grid gap-3",
            metaColsPerRow === 1
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2",
          ].join(" ")}
        >
          {metaCells.map((cell) => (
            <div
              key={cell.id}
              className={[
                "min-w-0 text-xs sm:text-sm space-y-1",
                classes?.bodyCell,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="text-[0.7rem] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
                {headerLabel(cell.column.id)}
              </div>
              <div className="truncate text-foreground/90">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
