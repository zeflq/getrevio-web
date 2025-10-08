"use client";

import * as React from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { themeColumns, useThemesList, CreateThemeDialog, EditThemeSheet, DeleteThemeDialog, useSetDefaultTheme } from "@/features/themes";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableCards } from "@/shared/ui/data-table/DataTableCards";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import { Theme } from "@/types/domain";

export function MerchantThemesTab({ merchantId, defaultThemeId }: { merchantId: string; defaultThemeId?: string }) {
  // --- table state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: "merchantId", value: merchantId },
  ]);

  // --- dialogs state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // --- derived filters
  const q = getFilterValue(columnFilters, "name");
  const sortId = (sorting[0]?.id as "name" | "createdAt" | undefined) ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: themesResponse, isLoading } = useThemesList({
    q,
    merchantId,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
  });

  const rows = themesResponse?.data ?? [];
  const totalPages = themesResponse?.totalPages ?? 1;
  const total = themesResponse?.total ?? 0;

  const setDefault = useSetDefaultTheme(merchantId);

  const columns = themeColumns({
    onEdit: (id) => setEditId(id),
    onDelete: (id) => setDeleteId(id),
    onSetDefault: (id) => setDefault.mutate({ themeId: id }),
    defaultThemeId
  });

  const controller = useDataTableController({
    columns,
    data: rows,
    mode: "server",
    pageCount: totalPages,
    state: { pageIndex, pageSize, sorting, columnFilters },
    onPageChange: (p) => {
      setPageIndex(p.pageIndex);
      setPageSize(p.pageSize);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  const toolbar = (
    <DataTableToolbarBase
      table={controller.table}
      rightExtras={
        <IconActionGroup
          actions={[
            {
              onClick: () => setCreateOpen(true),
              icon: <span className="font-bold text-lg">+</span>,
              ariaLabel: "Create Theme",
              variant: "default",
            },
          ]}
        />
      }
      serverMode
    />
  );

  return (
    <div className="space-y-4">
      {/* Render dialogs/sheets */}
      <CreateThemeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        merchantsLite={[]}
        onSuccess={() => controller.table.resetRowSelection()}
        merchantId={merchantId}
      />
      {editId && (
        <EditThemeSheet
          themeId={editId}
          open={!!editId}
          onOpenChange={(open) => !open && setEditId(null)}
          onSuccess={() => setEditId(null)}
        />
      )}
      {deleteId && (
        <DeleteThemeDialog
          themeId={deleteId}
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
        />
      )}

      {/* Mobile: cards */}
        <DataTableCards
            controller={controller as any}
            toolbar={toolbar}
            isLoading={isLoading}
            emptyText="No themes found."
            serverTotalRowsLabel={`${total} theme(s)`}
            rowClassName={(row) => {
                const theme = row.original as Theme;
                return defaultThemeId && theme.id === defaultThemeId
                ? "bg-muted/60 ring-1 ring-primary/50"
                : undefined;
            }}
            classes={{
                // container: "rounded-xl",
                // headerCell: "text-lg font-bold",
                // bodyCell: "text-sm",
            }}
        />
    </div>
  );
}

function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((f) => f.id === id)?.value as string | undefined;
}
