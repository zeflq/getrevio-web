"use client";

import * as React from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CampaignColumns } from "@/features/campaigns/components/columns";

// NEW API
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableTable } from "@/shared/ui/data-table/DataTableTable";
import { DataTableCards } from "@/shared/ui/data-table/DataTableCards";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";

// Optional future hooks for dropdowns
import { useCampaignsList, CreateCampaignDialog, EditCampaignSheet, DeleteCampaignDialog } from "@/features/campaigns";
import { GenericCombobox } from "@/components/ui/genericCombobox";
import { useMerchantsLite } from "@/features/merchants/hooks/useMerchantCrud";
// import { usePlacesLite } from "@/features/places/hooks/usePlacesLite";

export default function AdminCampaignsPage() {
  const router = useRouter();

  // --- table state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // --- derived filters for API
  const q = getFilterValue(columnFilters, "name");
  const status = getFilterValue(columnFilters, "status") as "draft" | "active" | "archived" | undefined;
  const merchantId = getFilterValue(columnFilters, "merchantId") as string | undefined;
  const placeId = getFilterValue(columnFilters, "placeId") as string | undefined;

  const sortId = sorting[0]?.id as "createdAt" | "name" | "status" | undefined;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: campaignsResponse, isLoading } = useCampaignsList({
    q,
    status,
    merchantId,
    placeId,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
  });

  const merchantsLiteQuery = useMerchantsLite();

  const rows = campaignsResponse?.data ?? [];
  const totalPages = campaignsResponse?.totalPages ?? 1;
  const total = campaignsResponse?.total ?? 0;

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);

  const columns = CampaignColumns({
    onEdit: (id) => setEditId(id),
    onDelete: (id, name) => setDeleteTarget({ id, name }),
  });

  // --- controller (shared by both renderers)
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

  // --- toolbar (left: filters, right: create)
  const toolbar = (
    <DataTableToolbarBase
      table={controller.table}
      searchKey="name"
      searchPlaceholder="Search campaigns…"
      leftExtras={
        // Make filters stack on mobile, horizontal on sm+
        <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center">
          {/* Status filter */}
          <Select
            value={status ?? "all"}
            onValueChange={(val) =>
              setColumnFilters((prev) => upsertFilter(prev, "status", val === "all" ? undefined : val))
            }
          >
            {/* Full width on mobile, constrained on sm+ */}
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
          <GenericCombobox
            options={merchantsLiteQuery.data ?? []}
            value={merchantId ?? null}
            onChange={(v) =>
              setColumnFilters((prev) => upsertFilter(prev, "merchantId", v ?? undefined))
            }
            getOptionValue={(m) => m.value}
            getOptionLabel={(m) => m.label}
            placeholder="Merchant"
            searchPlaceholder="Search merchants…"
            loading={merchantsLiteQuery.isLoading}
          />
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
            },
          ]}
        />
      }
      serverMode
    />
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Render dialogs/sheets */}
      
      <CreateCampaignDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        merchantsLite={merchantsLiteQuery.data ?? []}
        onSuccess={() => controller.table.resetRowSelection()}
      />
      {editId && (
        <EditCampaignSheet
          campaignId={editId}
          open={!!editId}
          onOpenChange={(open) => !open && setEditId(null)}
          merchantsLite={merchantsLiteQuery.data ?? []}
          onSuccess={() => setEditId(null)}
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
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage campaigns</p>
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block">
          <DataTableTable
            controller={controller}
            toolbar={toolbar} // override base; provides left/right slots already
            isLoading={isLoading}
            emptyText="No campaigns found."
            serverTotalRowsLabel={`${total} campaign(s)`}
            classes={{
              container: "rounded-xl",
              headerCell: "text-xs uppercase tracking-wide",
              bodyCell: "text-sm",
            }}
          />
        </div>

        {/* Mobile: cards */}
        <div className="md:hidden">
          <DataTableCards
            controller={controller}
            toolbar={toolbar}
            isLoading={isLoading}
            emptyText="No campaigns found."
            serverTotalRowsLabel={`${total} campaign(s)`}
            onRowClick={(id) => router.push(`/admin/campaigns/${id}`)}
            classes={{
              container: "rounded-xl",
              headerCell: "text-md",
              bodyCell: "text-sm",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** Helpers to read/update column filters */
function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((f) => f.id === id)?.value as string | undefined;
}
function upsertFilter(filters: ColumnFiltersState, id: string, value?: string) {
  const next = filters.filter((f) => f.id !== id);
  if (value === undefined || value === "") return next;
  return [...next, { id, value }];
}
