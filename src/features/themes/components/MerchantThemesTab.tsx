"use client";

import * as React from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import {
  themeColumns,
  useThemesList,
  CreateThemeDialog,
  EditThemeSheet,
  DeleteThemeDialog,
  useSetDefaultTheme,
} from "@/features/themes";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableCards } from "@/shared/ui/data-table/DataTableCards";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import type { Theme } from "@/types/domain";

type Props = {
  merchantId: string;
  defaultThemeId?: string;
};

export function MerchantThemesTab({ merchantId, defaultThemeId }: Props) {
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
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);

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

  const rows: Array<Theme & { id: string; name: string }> = (themesResponse?.data ?? []) as any[];
  const totalPages = themesResponse?.totalPages ?? 1;
  const total = themesResponse?.total ?? 0;

  const { execute: setDefaultTheme, isExecuting: isSettingDefault } = useSetDefaultTheme(merchantId);

  const columns = themeColumns({
    onEdit: (id) => setEditId(id),
    onDelete: (id) => {
      const t = rows.find((r) => r.id === id);
      setDeleteTarget({ id, name: t?.name ?? "" });
    },
    onSetDefault: (id) => setDefaultTheme({ merchantId, themeId: id }),
    defaultThemeId,
    isSettingDefault,
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
      {/* Create */}
      <CreateThemeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        merchantsLite={[]} // not used when merchantId is locked
        onSuccess={() => controller.table.resetRowSelection()}
        merchantId={merchantId}
      />

      {/* Edit */}
      {editId && (
        <EditThemeSheet
          themeId={editId}
          open={!!editId}
          onOpenChange={(open) => !open && setEditId(null)}
          onSuccess={() => setEditId(null)}
        />
      )}

      {/* Delete (with name passed) */}
      {deleteTarget && (
        <DeleteThemeDialog
          themeId={deleteTarget.id}
          themeName={deleteTarget.name}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        />
      )}

      {/* Mobile: cards */}
      <DataTableCards
        controller={controller}
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
      />
    </div>
  );
}

function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((f) => f.id === id)?.value as string | undefined;
}
