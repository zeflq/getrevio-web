"use client";

import * as React from "react";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

import { useIsMobile } from "@/hooks/use-mobile";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableResponsive } from "@/shared/ui/data-table/DataTableResponsive";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { useMerchantsLite } from "@/features/merchants";

import {
  landingColumns,
  CreateLandingDialog,
  DeleteLandingDialog,
  useLandingsList,
} from "@/features/landings";

export default function LandingsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const merchantsLiteQuery = useMerchantsLite();

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

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);

  const q = getFilterValue(columnFilters, "name");
  const sortId = (sorting[0]?.id as "name" | "createdAt" | "status" | undefined) ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: landingsResponse, isLoading } = useLandingsList({
    q,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
  });

  const rows = landingsResponse?.data ?? [];
  const totalPages = landingsResponse?.totalPages ?? 1;
  const total = landingsResponse?.total ?? 0;

  const columns = landingColumns({
    onEdit: (id) => {
      router.push(`/admin/landings/${id}/edit`);
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
      searchKey="name"
      searchPlaceholder="Search landings…"
      rightExtras={
        <IconActionGroup
          actions={[
            {
              onClick: () => setCreateDialogOpen(true),
              icon: <Plus className="h-4 w-4" />,
              ariaLabel: "Create Landing",
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
          <h1 className="text-3xl font-bold tracking-tight">Landings</h1>
          <p className="text-muted-foreground">Manage reusable landing experiences.</p>
        </div>

        <DataTableResponsive
          controller={controller}
          toolbar={toolbar}
          isLoading={isLoading}
          emptyText="No landings found."
          serverTotalRowsLabel={`${total} landing(s)`}
          cardActionsColumnId="actionsMenu"
          cardExcludeColumnIds={["actions"]}
          metaColsPerRow={2}
          onRowClick={(id) => router.push(`/admin/landings/${id}/edit`)}
        />
      </div>

      <CreateLandingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        merchantsLite={merchantsLiteQuery.data ?? []}
      />

      {selectedId && (
        <DeleteLandingDialog
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
