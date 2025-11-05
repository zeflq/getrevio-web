"use client";

import * as React from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableResponsive } from "@/shared/ui/data-table/DataTableResponsive";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  CampaignColumns,
  CreateCampaignDialog,
  EditCampaignSheet,
  DeleteCampaignDialog,
} from "@/features/campaigns";
import { useCampaignsList } from "@/features/campaigns/hooks/useCampaignCrud";
import { useThemesLite } from "@/features/themes";

function useActiveTenantId() {
  const { data: session } = useSession();

  return React.useMemo(() => {
    const raw =
      (session as any)?.session?.activeOrganizationId ??
      (session as any)?.user?.activeOrganizationId ??
      (session as any)?.user?.tenantId ??
      undefined;

    return typeof raw === "string" && raw.length > 0 ? raw : undefined;
  }, [session]);
}

export default function MerchantCampaignsPage() {
  const isMobile = useIsMobile();
  const tenantId = useActiveTenantId();

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(() => (isMobile ? 5 : 10));
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    const next = isMobile ? 5 : 10;
    if (next !== pageSize) {
      setPageSize(next);
      setPageIndex(0);
    }
  }, [isMobile, pageSize]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [tenantId]);

  const q = getFilterValue(columnFilters, "name");
  const status = getFilterValue(columnFilters, "status") as "draft" | "active" | "archived" | undefined;

  const sortId = (sorting[0]?.id as "createdAt" | "name" | "status" | undefined) ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: campaignsResponse, isLoading } = useCampaignsList({
    q,
    status,
    merchantId: tenantId,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
  });

  const rows = campaignsResponse?.data ?? [];
  const totalPages = campaignsResponse?.totalPages ?? 1;
  const total = campaignsResponse?.total ?? 0;

  const themesLiteQuery = useThemesLite(
    { merchantId: tenantId || undefined, _limit: 100 },
    { enabled: !!tenantId }
  );
  const themesLite = themesLiteQuery.data ?? [];
  const showThemeSelect = themesLite.length > 1;

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);

  const columns = React.useMemo(
    () =>
      CampaignColumns({
        onView: (id) => setEditId(id),
        onEdit: (id) => setEditId(id),
        onDelete: (id, name) => setDeleteTarget({ id, name }),
        showMerchantColumn: false,
      }),
    []
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
      searchPlaceholder="Search campaigns…"
      leftExtras={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={status ?? "all"}
            onValueChange={(val) =>
              setColumnFilters((prev) => upsertFilter(prev, "status", val === "all" ? undefined : val))
            }
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      rightExtras={
        <IconActionGroup
          actions={[
            {
              onClick: () => setCreateOpen(true),
              icon: <Plus className="h-4 w-4" />,
              ariaLabel: "Create Campaign",
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
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage your campaigns.</p>
        </div>

        <DataTableResponsive
          controller={controller}
          toolbar={toolbar}
          isLoading={isLoading}
          emptyText="No campaigns found."
          serverTotalRowsLabel={`${total} campaign(s)`}
          cardActionsColumnId="actions"
          cardExcludeColumnIds={["actions"]}
          metaColsPerRow={2}
          onRowClick={(id) => setEditId(id)}
        />
      </div>

      <CreateCampaignDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        merchantId={tenantId}
        onSuccess={() => controller.table.resetRowSelection()}
        themesLite={themesLite}
        themesLoading={themesLiteQuery.isLoading}
        showThemeSelect={showThemeSelect}
      />

      {editId && (
        <EditCampaignSheet
          campaignId={editId}
          open={!!editId}
          onOpenChange={(open) => !open && setEditId(null)}
          merchantId={tenantId}
          onSuccess={() => setEditId(null)}
          themesLite={themesLite}
          themesLoading={themesLiteQuery.isLoading}
          showThemeSelect={showThemeSelect}
        />
      )}

      {deleteTarget && (
        <DeleteCampaignDialog
          campaignId={deleteTarget.id}
          campaignName={deleteTarget.name}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((f) => f.id === id)?.value as string | undefined;
}

function upsertFilter(filters: ColumnFiltersState, id: string, value: unknown) {
  const next = filters.filter((f) => f.id !== id);
  if (value !== undefined && value !== null && value !== "") {
    next.push({ id, value });
  }
  return next;
}
