"use client";

import * as React from "react";
import { DataTable } from "@/shared/ui/data-table/DataTable";
import { campaignColumns } from "@/features/campaigns/components/columns";
import { useCampaigns } from "@/features/campaigns/hooks/useCampaigns";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

// Optional: you might have hooks to list merchants/places for dropdowns
// import { useMerchantsLite } from "@/features/merchants/hooks/useMerchantsLite";
// import { usePlacesLite } from "@/features/places/hooks/usePlacesLite";

export default function AdminCampaignsPage() {
  // Table state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Derived filters for the API (map table filters -> query params)
  const q = getFilterValue(columnFilters, "name");
  const status = getFilterValue(columnFilters, "status") as "draft" | "active" | "archived" | undefined;
  const merchantId = getFilterValue(columnFilters, "merchantId") as string | undefined;
  const placeId = getFilterValue(columnFilters, "placeId") as string | undefined;

  const sortId = sorting[0]?.id as "createdAt" | "name" | "status" | undefined;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: campaignsResponse, isLoading } = useCampaigns({
    q,
    status,
    merchantId,
    placeId,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
  });

  const rows = campaignsResponse?.data ?? [];
  const totalPages = campaignsResponse?.totalPages ?? 1;
  const total = campaignsResponse?.total ?? 0;

  const columns = campaignColumns({
    onEdit: (id) => console.log("edit", id),
    onDelete: (id) => console.log("delete", id),
  });

  // Toolbar extras: controlled selects that write into column filters
  const toolbar = (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Status filter */}
      <Select
        value={status ?? "all"}
        onValueChange={(val) =>
          setColumnFilters((prev) => upsertFilter(prev, "status", val === "all" ? undefined : val))
        }
      >
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      {/* Merchant filter (MVP: free text id; later replace with Select from useMerchantsLite) */}
      {/* <MerchantSelect value={merchantId ?? "all"} onChange={(id) => ... } /> */}
      <Select
        value={merchantId ?? "all"}
        onValueChange={(val) =>
          setColumnFilters((prev) => upsertFilter(prev, "merchantId", val === "all" ? undefined : val))
        }
      >
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Merchant" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Merchants</SelectItem>
          <SelectItem value="mer_1">mer_1</SelectItem>
          <SelectItem value="mer_2">mer_2</SelectItem>
        </SelectContent>
      </Select>
      
      <Button onClick={() => console.log("open create dialog")}>
        <Plus className="mr-2 h-4 w-4" />
        Create Campaign
      </Button>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage campaigns</p>
        </div>
        <DataTable
          mode="server"
          columns={columns}
          data={rows}
          isLoading={isLoading}
          searchKey="name"
          renderToolbarExtras={toolbar}
          pageCount={totalPages}
          totalRowsLabel={`${total} campaign(s)`}
          state={{ pageIndex, pageSize, sorting, columnFilters }}
          onPageChange={(p) => { setPageIndex(p.pageIndex); setPageSize(p.pageSize); }}
          onSortingChange={setSorting}
          onColumnFiltersChange={setColumnFilters}
        />
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
