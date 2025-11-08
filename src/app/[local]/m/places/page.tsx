"use client";

import * as React from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import {
  placeColumns,
  CreatePlaceDialog,
  EditPlaceSheet,
  DeletePlaceDialog,
  usePlacesList,
} from "@/features/places";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableResponsive } from "@/shared/ui/data-table/DataTableResponsive";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";

export default function MerchantPlacesPage() {
  const isMobile = useIsMobile();
  const activeTenantId = useActiveTenantId();

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(() => (isMobile ? 5 : 10));
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    const newPageSize = isMobile ? 5 : 10;
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPageIndex(0);
    }
  }, [isMobile, pageSize]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [activeTenantId]);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editSheetOpen, setEditSheetOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);

  const q = getFilterValue(columnFilters, "localName");
  const sortId = (sorting[0]?.id as "localName" | "createdAt" | undefined) ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: placesResponse, isLoading } = usePlacesList({
    q,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
    merchantId: activeTenantId,
  });

  const rows = placesResponse?.data ?? [];
  const totalPages = placesResponse?.totalPages ?? 1;
  const total = placesResponse?.total ?? 0;

  const columns = placeColumns({
    onEdit: (id) => {
      setSelectedId(id);
      setEditSheetOpen(true);
    },
    onDelete: (id) => {
      setSelectedId(id);
      setDeleteDialogOpen(true);
    },
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
      searchKey="localName"
      searchPlaceholder="Search places…"
      rightExtras={
        <IconActionGroup
          actions={[
            {
              onClick: () => {
                if (!activeTenantId) return;
                setCreateDialogOpen(true);
              },
              icon: <Plus className="h-4 w-4" />,
              ariaLabel: "Create Place",
              variant: "default",
              disabled: !activeTenantId,
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
          <h1 className="text-3xl font-bold tracking-tight">Places</h1>
          <p className="text-muted-foreground">Manage your locations.</p>
        </div>

        <DataTableResponsive
          controller={controller}
          toolbar={toolbar}
          isLoading={isLoading}
          emptyText="No places found."
          serverTotalRowsLabel={`${total} place(s)`}
          cardActionsColumnId="actionsMenu"
          cardExcludeColumnIds={["actions"]}
          metaColsPerRow={2}
          onRowClick={(id) => {
            setSelectedId(id);
            setEditSheetOpen(true);
          }}
        />
      </div>

      <CreatePlaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        merchantId={activeTenantId}
      />

      {selectedId && (
        <EditPlaceSheet
          id={selectedId}
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          merchantId={activeTenantId}
        />
      )}

      {selectedId && (
        <DeletePlaceDialog
          id={selectedId}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </div>
  );
}

function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((f) => f.id === id)?.value as string | undefined;
}
