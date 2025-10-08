"use client";

import * as React from "react";
import { DataTableToolbarBase } from "./DataTableToolbarBase";
import { DataTableTable } from "./DataTableTable";
import { DataTableCards } from "./DataTableCards";

export type DataTableClasses = {
  container?: string;
  headerCell?: string;
  bodyCell?: string;
};

// Minimal controller shape (or import ReturnType<typeof useDataTableController<T, any>>)
type ControllerShape<TData> = {
  table: import("@tanstack/react-table").Table<TData>;
  mode: "client" | "server";
  thPad: string;
  tdPad: string;
};

type CommonProps<TData> = {
  controller: ControllerShape<TData>;

  /**
   * If provided:
   *  - toolbar={null} → no toolbar
   *  - toolbar={<Custom />} → render custom toolbar
   * If omitted, renders <DataTableToolbarBase /> using slots below.
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
  serverTotalRowsLabel?: string;

  /** Table-only */
  stickyHeader?: boolean;

  /** Styling hooks (3 classes as requested) */
  classes?: DataTableClasses;

  /** Breakpoint class for switching layout (default: md) */
  breakpoint?: "sm" | "md" | "lg";
};

type CardOnlyProps<TData extends { id: string }> = {
  cardActionsColumnId?: string;
  cardExcludeColumnIds?: string[];
  metaColsPerRow?: 1 | 2;
  onRowClick?: (id: string, row: TData) => void;
};

export function DataTableResponsive<TData extends { id: string }>({
  controller,
  toolbar,
  searchKey,
  searchPlaceholder = "Search…",
  leftExtras,
  rightExtras,
  isLoading,
  emptyText = "No results.",
  serverTotalRowsLabel,
  stickyHeader,
  classes,
  breakpoint = "md",
  metaColsPerRow = 2,
  onRowClick,
}: CommonProps<TData> & CardOnlyProps<TData>) {
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

  // CSS helpers for breakpoint switching
  const desktopShow = `hidden ${breakpoint}:block`;
  const mobileShow = `${breakpoint}:hidden`;

  return (
    <div className={["space-y-4", classes?.container].filter(Boolean).join(" ")}>
      {/* Desktop: Table */}
      <div className={desktopShow}>
        <DataTableTable
          controller={controller}
          toolbar={renderToolbar()}
          isLoading={isLoading}
          emptyText={emptyText}
          stickyHeader={stickyHeader}
          serverTotalRowsLabel={serverTotalRowsLabel}
          classes={classes}
        />
      </div>

      {/* Mobile: Cards */}
      <div className={mobileShow}>
        <DataTableCards
          controller={controller}
          toolbar={renderToolbar()}
          isLoading={isLoading}
          emptyText={emptyText}
          serverTotalRowsLabel={serverTotalRowsLabel}
          metaColsPerRow={metaColsPerRow}
          onRowClick={onRowClick}
          classes={classes}
        />
      </div>
    </div>
  );
}
