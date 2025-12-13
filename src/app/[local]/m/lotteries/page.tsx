"use client";

import * as React from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import { useRouter } from "@/i18n/navigation";
import { lotteryColumns, CreateLotteryDialog, DeleteLotteryDialog, useLotteriesList } from "@/features/lotteries";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableResponsive } from "@/shared/ui/data-table/DataTableResponsive";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useTranslations } from "next-intl";

export default function MerchantLotteriesPage() {
  const isMobile = useIsMobile();
  const activeTenantId = useActiveTenantId();
  const router = useRouter();
  const t = useTranslations("lotteries.list");

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
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name?: string } | null>(null);

  const q = getFilterValue(columnFilters, "name");
  const sortId = (sorting[0]?.id as "name" | "createdAt" | undefined) ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: lotteriesResponse, isLoading } = useLotteriesList({
    q,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
    merchantId: activeTenantId,
  });

  const rows = lotteriesResponse?.data ?? [];
  const totalPages = lotteriesResponse?.totalPages ?? 1;
  const total = lotteriesResponse?.total ?? 0;

  const columns = lotteryColumns({
    t,
    onEdit: (id) => {
      router.push(`/m/lotteries/${id}`);
    },
    onDelete: (id) => {
      const row = rows.find((row) => row.id === id);
      setDeleteTarget(row ? { id, name: row.name } : { id });
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
      searchPlaceholder={t("searchPlaceholder")}
      rightExtras={
        <IconActionGroup
          actions={[
            {
              onClick: () => {
                if (!activeTenantId) return;
                setCreateDialogOpen(true);
              },
              icon: <Plus className="h-4 w-4" />,
              ariaLabel: t("create"),
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
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("descriptionMerchant")}</p>
        </div>

        <DataTableResponsive
          controller={controller}
          toolbar={toolbar}
          isLoading={isLoading}
          emptyText={t("empty")}
          serverTotalRowsLabel={t("totalRows", { count: total })}
          cardActionsColumnId="actions"
          cardExcludeColumnIds={["actions"]}
          metaColsPerRow={2}
          onRowClick={(id) => router.push(`/m/lotteries/${id}`)}
        />
      </div>

      <CreateLotteryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        merchantId={activeTenantId ?? undefined}
      />

      {deleteTarget && deleteTarget.id && (
        <DeleteLotteryDialog
          id={deleteTarget.id}
          name={deleteTarget.name}
          open={!!deleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
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
