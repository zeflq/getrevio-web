"use client";

import * as React from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableResponsive } from "@/shared/ui/data-table/DataTableResponsive";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  shortlinkColumns,
  useShortlinksList,
  CreateShortlinkDialog,
  EditShortlinkSheet,
  DeleteShortlinkDialog,
  ShortlinkQrDialog,
} from "@/features/shortlinks";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";

const SORTABLE_COLUMNS = ["code", "channel", "createdAt", "updatedAt"] as const;

export default function MerchantShortlinksPage() {
  const isMobile = useIsMobile();
  const tenantId = useActiveTenantId();

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(() => (isMobile ? 5 : 10));
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    const nextSize = isMobile ? 5 : 10;
    if (nextSize !== pageSize) {
      setPageSize(nextSize);
      setPageIndex(0);
    }
  }, [isMobile, pageSize]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [tenantId]);

  const search = getFilterValue(columnFilters, "code");
  const channel = getFilterValue(columnFilters, "channel") as
    | "qr"
    | "nfc"
    | "email"
    | "web"
    | "print"
    | "custom"
    | undefined;
  const active = getFilterValue(columnFilters, "active") as boolean | undefined;

  const sortIdRaw = sorting[0]?.id as string | undefined;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";
  const sortId = SORTABLE_COLUMNS.includes(sortIdRaw as (typeof SORTABLE_COLUMNS)[number])
    ? (sortIdRaw as (typeof SORTABLE_COLUMNS)[number])
    : undefined;

  const { data: shortlinksResponse, isLoading } = useShortlinksList({
    q: search,
    channel,
    active,
    merchantId: tenantId,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortId ? sortOrder : undefined,
  });

  const rows = shortlinksResponse?.data ?? [];
  const totalPages = shortlinksResponse?.totalPages ?? 1;
  const total = shortlinksResponse?.total ?? 0;

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; code: string } | null>(null);
  const [qrData, setQrData] = React.useState<{ code: string; url: string } | null>(null);
  const [qrOpen, setQrOpen] = React.useState(false);

  const columns = React.useMemo(
    () =>
      shortlinkColumns({
        onEdit: (id) => setEditId(id),
        onDelete: (id, code) => setDeleteTarget({ id, code }),
        onShowQr: (code, shortUrl) => {
          setQrData({ code, url: shortUrl });
          setQrOpen(true);
        },
        showMerchantColumn: false,
        mode: "merchant",
      }),
    [setEditId, setDeleteTarget, setQrData, setQrOpen]
  );

  const controller = useDataTableController({
    columns,
    data: rows,
    mode: "server",
    pageCount: totalPages,
    state: { pageIndex, pageSize, sorting, columnFilters },
    onPageChange: (page) => {
      setPageIndex(page.pageIndex);
      setPageSize(page.pageSize);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  const toolbar = (
    <DataTableToolbarBase
      table={controller.table}
      searchKey="code"
      searchPlaceholder="Search shortlinks…"
      leftExtras={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={channel ?? "all"}
            onValueChange={(value) =>
              setColumnFilters((prev) => upsertFilter(prev, "channel", value === "all" ? undefined : value))
            }
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="qr">QR</SelectItem>
              <SelectItem value="nfc">NFC</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="print">Print</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={active === undefined ? "all" : active ? "active" : "inactive"}
            onValueChange={(value) =>
              setColumnFilters((prev) =>
                upsertFilter(
                  prev,
                  "active",
                  value === "all" ? undefined : value === "active"
                )
              )
            }
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
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
              ariaLabel: "Create Shortlink",
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
          <h1 className="text-3xl font-bold tracking-tight">Shortlinks</h1>
          <p className="text-muted-foreground">Manage and track your shortlinks.</p>
        </div>

        <DataTableResponsive
          controller={controller}
          toolbar={toolbar}
          isLoading={isLoading}
          emptyText="No shortlinks found."
          serverTotalRowsLabel={`${total} shortlink(s)`}
          cardActionsColumnId="actions"
          cardExcludeColumnIds={["actions"]}
          metaColsPerRow={2}
          onRowClick={(id) => setEditId(id)}
        />
      </div>

      <CreateShortlinkDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        merchantId={tenantId}
        onSuccess={() => controller.table.resetRowSelection()}
      />

      {editId && (
        <EditShortlinkSheet
          id={editId}
          open={!!editId}
          onOpenChange={(open) => !open && setEditId(null)}
          merchantId={tenantId}
          onSuccess={() => setEditId(null)}
        />
      )}

      {deleteTarget && (
        <DeleteShortlinkDialog
          id={deleteTarget.id}
          code={deleteTarget.code}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        />
      )}

      <ShortlinkQrDialog
        open={qrOpen}
        code={qrData?.code ?? null}
        shortUrl={qrData?.url}
        onOpenChange={(open) => {
          setQrOpen(open);
          if (!open) {
            setQrData(null);
          }
        }}
      />
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
