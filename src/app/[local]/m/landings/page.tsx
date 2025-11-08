"use client";

import * as React from "react";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { useIsMobile } from "@/hooks/use-mobile";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableResponsive } from "@/shared/ui/data-table/DataTableResponsive";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import { useRouter } from "@/i18n/navigation";

import {
  landingColumns,
  useLandingsList,
  CreateLandingDialog,
  DeleteLandingDialog,
} from "@/features/landings";

export default function MerchantLandingsPage() {
  const tCommon = useTranslations("landings.common");
  const tTable = useTranslations("landings.table");
  const router = useRouter();
  const isMobile = useIsMobile();
  const tenantId = useActiveTenantId();

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(() => (isMobile ? 5 : 10));
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | undefined>();

  React.useEffect(() => {
    const newSize = isMobile ? 5 : 10;
    if (newSize !== pageSize) {
      setPageSize(newSize);
      setPageIndex(0);
    }
  }, [isMobile, pageSize]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [tenantId]);

  const q = getFilterValue(columnFilters, "name");
  const sortId = (sorting[0]?.id as "name" | "createdAt" | "status" | undefined) ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: landingsResponse, isLoading } = useLandingsList({
    q,
    merchantId: tenantId,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
  });

  const rows = landingsResponse?.data ?? [];
  const totalPages = landingsResponse?.totalPages ?? 1;
  const total = landingsResponse?.total ?? 0;

  const columns = React.useMemo(
    () =>
      landingColumns({
        onEdit: (id) => {
          router.push(`/m/landings/${id}/edit`);
        },
        onDelete: (id) => {
          setSelectedId(id);
          setDeleteDialogOpen(true);
        },
        showMerchantColumn: false,
        labels: {
          nameHeader: tTable("headers.name"),
          merchantHeader: tTable("headers.merchant"),
          statusHeader: tTable("headers.status"),
          attachedHeader: tTable("headers.attached"),
          updatedHeader: tTable("headers.updated"),
          actionsHeader: tTable("headers.actions"),
          statusDraft: tTable("statuses.draft"),
          statusPublished: tTable("statuses.published"),
          statusArchived: tTable("statuses.archived"),
          attachedCampaignPrefix: `${tTable("attached.campaign")} · `,
          attachedPlacePrefix: `${tTable("attached.place")} · `,
          emptyValue: tTable("attached.none"),
        },
      }),
    [tTable]
  );

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
      searchPlaceholder={tTable("searchPlaceholder")}
      rightExtras={
        <IconActionGroup
          actions={[
            {
              onClick: () => setCreateDialogOpen(true),
              icon: <Plus className="h-4 w-4" />,
              ariaLabel: tTable("create"),
              variant: "default",
              disabled: !tenantId,
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
          <h1 className="text-3xl font-bold tracking-tight">{tTable("title")}</h1>
          <p className="text-muted-foreground">{tTable("description")}</p>
        </div>

        <DataTableResponsive
          controller={controller}
          toolbar={toolbar}
          isLoading={isLoading}
          emptyText={tTable("empty")}
          serverTotalRowsLabel={tTable("total", { count: total })}
          cardActionsColumnId="actions"
          cardExcludeColumnIds={["actions"]}
          metaColsPerRow={2}
          onRowClick={(id) => router.push(`/m/landings/${id}/edit`)}
        />
      </div>

      <CreateLandingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        merchantId={tenantId}
        merchantsLite={[]}
        redirectBasePath="/m/landings"
      />

      {selectedId && (
        <DeleteLandingDialog
          id={selectedId}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteDialogOpen(false);
              setSelectedId(undefined);
            }
          }}
        />
      )}
    </div>
  );
}

function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((f) => f.id === id)?.value as string | undefined;
}
