'use client';

import * as React from 'react';
import { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

import { iconActionGroup as IconActionGroup } from '@/shared/ui/IconActionGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { MerchantColumns } from '@/features/merchants/components/columns';
import { useMerchantsList } from '@/features/merchants/hooks/useMerchantCrud';
import { CreateMerchantDialog } from '@/features/merchants/components/CreateMerchantDialog';
import { EditMerchantSheet } from '@/features/merchants/components/EditMerchantSheet';
import { DeleteMerchantDialog } from '@/features/merchants/components/DeleteMerchantDialog';

// NEW API
import { useDataTableController } from '@/shared/ui/data-table/useDataTableController';
import { DataTableResponsive } from '@/shared/ui/data-table/DataTableResponsive';
import { DataTableToolbarBase } from '@/shared/ui/data-table/DataTableToolbarBase';

export default function MerchantsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // --- table state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(() => (isMobile ? 5 : 10));
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    const newPageSize = isMobile ? 5 : 10;
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPageIndex(0);
    }
  }, [isMobile, pageSize]);

  // --- dialogs
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editSheetOpen, setEditSheetOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = React.useState<string | undefined>(undefined);

  // Store both id & name when user clicks delete
  const [deletingMerchant, setDeletingMerchant] = React.useState<{ id: string; name: string } | null>(null);

  // --- derived filters
  const q = getFilterValue(columnFilters, "name");
  const plan = getFilterValue(columnFilters, "plan") as "free" | "pro" | "enterprise" | undefined;
  const status = getFilterValue(columnFilters, "status") as "active" | "suspended" | undefined;

  const sortId = (sorting[0]?.id as "name" | "createdAt" | "plan" | "status" | undefined) ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: merchantsResponse, isLoading } = useMerchantsList({
    q,
    plan,
    status,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
  });

  const rows = merchantsResponse?.data ?? [];
  const totalPages = merchantsResponse?.totalPages ?? 1;
  const total = merchantsResponse?.total ?? 0;

  // Preferred: columns call onDelete(id, name)
  const columns = MerchantColumns({
    onEdit: (id) => {
      setSelectedMerchantId(id);
      setEditSheetOpen(true);
    },
    onDelete: (id, name) => {
      setDeletingMerchant({ id, name });
      setDeleteDialogOpen(true);
    },
  });

  // --- controller shared by both views
  const controller = useDataTableController({
    columns,
    data: rows,
    mode: 'server',
    pageCount: totalPages,
    state: { pageIndex, pageSize, sorting, columnFilters },
    onPageChange: (p) => {
      setPageIndex(p.pageIndex);
      setPageSize(p.pageSize);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  // --- toolbar with left/right slots (can also pass as `toolbar` directly)
  const toolbar = (
    <DataTableToolbarBase
      table={controller.table}
      searchKey="name"
      searchPlaceholder="Search merchants…"
      leftExtras={
        <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center">
          <Select
            value={plan ?? 'all'}
            onValueChange={(val) => {
              setColumnFilters((prev) => upsertFilter(prev, 'plan', val === 'all' ? undefined : val));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={status ?? "all"}
            onValueChange={(val) => {
              setColumnFilters((prev) => upsertFilter(prev, "status", val === "all" ? undefined : val));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      rightExtras={
        <IconActionGroup
          actions={[
            {
              onClick: () => setCreateDialogOpen(true),
              icon: <Plus className="h-4 w-4" />,
              ariaLabel: "Create Merchant",
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
          <h1 className="text-3xl font-bold tracking-tight">Merchants</h1>
          <p className="text-muted-foreground">Manage merchants and their settings</p>
        </div>

        <DataTableResponsive
          controller={controller}
          toolbar={toolbar}
          isLoading={isLoading}
          emptyText="No merchants found."
          serverTotalRowsLabel={`${total} merchant(s)`}
          classes={{}}
          // Mobile cards behavior
          cardActionsColumnId="actionsMenu"
          cardExcludeColumnIds={['actions']}
          metaColsPerRow={2}
          onRowClick={(id) => router.push(`${pathname}/${id}`)}
        />
      </div>

      {/* Dialogs */}
      <CreateMerchantDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {selectedMerchantId && (
        <EditMerchantSheet
          merchantId={selectedMerchantId}
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
        />
      )}

      {deletingMerchant && (
        <DeleteMerchantDialog
          merchantId={deletingMerchant.id}
          merchantName={deletingMerchant.name}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setDeletingMerchant(null); // cleanup when closed
          }}
        />
      )}
    </div>
  );
}

/** Helpers to read/update column filters */
function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((f) => f.id === id)?.value as string | undefined;
}
function upsertFilter(filters: ColumnFiltersState, id: string, value?: string) {
  const next = filters.filter((f) => f.id !== id);
  if (value === undefined || value === '') return next;
  return [...next, { id, value }];
}
