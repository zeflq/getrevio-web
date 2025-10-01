"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

export function DataTableToolbar<TData>({
  table,
  searchKey,
  placeholder = "Search...",
  extras,
  serverMode = false,
}: {
  table: Table<TData>;
  searchKey?: string;
  placeholder?: string;
  extras?: React.ReactNode;
  serverMode?: boolean;
}) {
  const value =
    (searchKey ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "") : "") ?? "";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {searchKey ? (
        <Input
          className="max-w-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => table.getColumn(searchKey!)?.setFilterValue(e.target.value)}
        />
      ) : (
        <div />
      )}
      <div className="flex items-center gap-2">{extras}</div>
    </div>
  );
}