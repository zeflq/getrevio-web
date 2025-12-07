"use client";

import * as React from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import {
  lotteryColumns,
  CreateLotteryDialog,
  EditLotterySheet,
  DeleteLotteryDialog,
  useLotteriesList,
} from "@/features/lotteries";
import { useMerchantsLite } from "@/features/merchants";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableResponsive } from "@/shared/ui/data-table/DataTableResponsive";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";

export default function AdminLotteriesPage() {
  const merchantsLiteQuery = useMerchantsLite();

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editSheetOpen, setEditSheetOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);
  const [selectedTarget, setSelectedTarget] = React.useState<{ id: string; name?: string } | null>(null);

  const q = getFilterValue(columnFilters, "name");
  const sortId = (sorting[0]?.id as "name" | "createdAt" | undefined) ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: lotteriesResponse, isLoading } = useLotteriesList({
    q,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
  });

  const rows = lotteriesResponse?.data ?? [];
  const totalPages = lotteriesResponse?.totalPages ?? 1;
  const total = lotteriesResponse?.total ?? 0;

  const columns = lotteryColumns({
    onEdit: (id) => {
      setSelectedId(id);
      setEditSheetOpen(true);
    },
    onDelete: (id) => {
      const row = rows.find((row) => row.id === id);
      setSelectedTarget(row ? { id, name: row.name } : { id });
      setDeleteDialogOpen(true);
    },
  });

  const controller = useDataTableController({
    columns,
    data: rows,
    mode: "server",
    pageCount: totalPages,
    state: { pageIndex, pageSize, sorting, columnFilters },
    onPageChange: (state) => {
      setPageIndex(state.pageIndex);
      setPageSize(state.pageSize);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  const toolbar = (
    <DataTableToolbarBase
      table={controller.table}
      searchKey="name"
      searchPlaceholder="Search lotteries…"
      rightExtras={
        <IconActionGroup
          actions={[
            {
              onClick: () => setCreateDialogOpen(true),
              icon: <Plus className="h-4 w-4" />,
              ariaLabel: "Create Lottery",
              variant: "default",
            },
          ]}
        />
      }
      serverMode
    />
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lotteries</h1>
          <p className="text-muted-foreground">Manage lottery configurations.</p>
        </div>

        <DataTableResponsive
          controller={controller}
          toolbar={toolbar}
          isLoading={isLoading}
          emptyText="No lotteries found."
          serverTotalRowsLabel={`${total} lottery(s)`}
          cardActionsColumnId="actions"
          cardExcludeColumnIds={["actions"]}
          metaColsPerRow={2}
          onRowClick={(id) => {
            setSelectedId(id);
            setEditSheetOpen(true);
          }}
        />
      </div>

      <CreateLotteryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        merchantsLite={merchantsLiteQuery.data ?? []}
      />

      {selectedId && (
        <EditLotterySheet
          id={selectedId}
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          merchantsLite={merchantsLiteQuery.data ?? []}
        />
      )}

      {selectedTarget && selectedTarget.id && (
        <DeleteLotteryDialog
          id={selectedTarget.id}
          name={selectedTarget.name}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTarget(null);
            }
            setDeleteDialogOpen(open);
          }}
        />
      )}
    </div>
  );
}

function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((f) => f.id === id)?.value as string | undefined;
}
