"use client";

import * as React from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useForm, FormProvider } from "react-hook-form";
import { Plus } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { GenericCombobox } from "@/components/ui/genericCombobox";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import { DataTableResponsive } from "@/shared/ui/data-table/DataTableResponsive";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { RHFSelect } from "@/components/form/controls";

import { useAction } from "next-safe-action/hooks";
import {
  shortlinkColumns,
  useShortlinksList,
  CreateShortlinkDialog,
  EditShortlinkSheet,
  DeleteShortlinkDialog,
  checkRedisShortlinksAction,
} from "@/features/shortlinks";
import { useMerchantsLite } from "@/features/merchants/hooks/useMerchantCrud";

const SORTABLE_COLUMNS = ["code", "merchantId", "channel", "createdAt", "updatedAt"] as const;

export default function AdminShortlinksPage() {
  const isMobile = useIsMobile();

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

  const search = getFilterValue(columnFilters, "code");
  const merchantId = getFilterValue(columnFilters, "merchantId") as string | undefined;
  const channel = getFilterValue(columnFilters, "channel") as
    | "qr"
    | "nfc"
    | "email"
    | "web"
    | "print"
    | "custom"
    | undefined;
  const status = getFilterValue(columnFilters, "status") as "active" | "inactive" | undefined;
  const redis = getFilterValue(columnFilters, "redis") as "ok" | "missing" | "error" | undefined;

  const sortId = sorting[0]?.id as string | undefined;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";
  const isSortable = (value: string | undefined): value is (typeof SORTABLE_COLUMNS)[number] =>
  !!value && SORTABLE_COLUMNS.includes(value as (typeof SORTABLE_COLUMNS)[number]);

  const sortField = isSortable(sortId) ? sortId : undefined;

  const { data: shortlinksResponse, isLoading } = useShortlinksList({
    q: search,
    merchantId,
    channel,
    status,
    redis,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortField,
    _order: sortField ? sortOrder : undefined,
  });

  const merchantsLiteQuery = useMerchantsLite();

  const rows = shortlinksResponse?.data ?? [];
  const totalPages = shortlinksResponse?.totalPages ?? 1;
  const total = shortlinksResponse?.total ?? 0;

  // Redis status: check existence for visible codes and decorate rows
  const codes = React.useMemo(() => Array.from(new Set(rows.map((r) => r.code))), [rows]);
  const [redisMap, setRedisMap] = React.useState<Record<string, "ok" | "missing" | "error">>({});
  const { execute: checkRedis } = useAction(checkRedisShortlinksAction, {
    onSuccess: ({ data }) => {
      const next: Record<string, "ok" | "missing" | "error"> = {};
      data.items.forEach(({ code, exists }: { code: string; exists: boolean }) => {
        next[code] = exists ? "ok" : "missing";
      });
      setRedisMap(next);
    },
    onError: () => {
      setRedisMap((prev) => {
        const next = { ...prev };
        codes.forEach((code) => (next[code] = "error"));
        return next;
      });
    },
  });

  React.useEffect(() => {
    if (codes.length) {
      checkRedis({ codes });
    }
  }, [codes, checkRedis]);

  const decoratedRows = React.useMemo(
    () => rows.map((sl) => ({ ...sl, redisStatus: redisMap[sl.code] ?? sl.redisStatus ?? "unknown" })),
    [rows, redisMap]
  );
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | undefined>(undefined);
  const [deleteId, setDeleteId] = React.useState<string | undefined>(undefined);
  const [deleteCode, setDeleteCode] = React.useState<string | undefined>(undefined);

  const columns = React.useMemo(
    () =>
      shortlinkColumns({
        onEdit: (id) => setEditId(id),
        onDelete: (id, code) => {
          setDeleteId(id);
          setDeleteCode(code);
        },
      }),
    [setEditId, setDeleteId, setDeleteCode]
  );

  const controller = useDataTableController({
    columns,
    data: decoratedRows,
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
          <GenericCombobox
            options={merchantsLiteQuery.data ?? []}
            value={merchantId ?? null}
            onChange={(value) => setColumnFilters((prev) => upsertFilter(prev, "merchantId", value ?? undefined))}
            getOptionValue={(merchant) => merchant.value}
            getOptionLabel={(merchant) => merchant.label}
            placeholder="Merchant"
            searchPlaceholder="Search merchants…"
            loading={merchantsLiteQuery.isLoading}
          />

          <FilterSelect
            className="w-full sm:w-[140px]"
            value={channel ?? "all"}
            onChange={(value) =>
              setColumnFilters((prev) => upsertFilter(prev, "channel", value === "all" ? undefined : value))
            }
            placeholder="All Channels"
            options={[
              { value: "qr", label: "QR" },
              { value: "nfc", label: "NFC" },
              { value: "email", label: "Email" },
              { value: "web", label: "Web" },
              { value: "print", label: "Print" },
              { value: "custom", label: "Custom" },
            ]}
          />

          <FilterSelect
            className="w-full sm:w-[140px]"
            value={status ?? "all"}
            onChange={(value) =>
              setColumnFilters((prev) => upsertFilter(prev, "status", value === "all" ? undefined : value))
            }
            placeholder="All Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />

          <FilterSelect
            className="w-full sm:w-[140px]"
            value={redis ?? "all"}
            onChange={(value) =>
              setColumnFilters((prev) => upsertFilter(prev, "redis", value === "all" ? undefined : value))
            }
            placeholder="Redis: All"
            options={[
              { value: "ok", label: "OK" },
              { value: "missing", label: "Missing" },
              { value: "error", label: "Error" },
            ]}
          />
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
          <p className="text-muted-foreground">Manage redirect codes stored in Redis.</p>
        </div>

        <DataTableResponsive
          controller={controller}
          toolbar={toolbar}
          isLoading={isLoading}
          emptyText="No shortlinks found."
          serverTotalRowsLabel={`${total} shortlink(s)`}
          cardActionsColumnId="actions"
          cardExcludeColumnIds={["actions"]}
          onRowClick={(_id, row) => setEditId(row.id)}
        />
      </div>

      <CreateShortlinkDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        merchantsLite={merchantsLiteQuery.data ?? []}
        onSuccess={() => controller.table.resetRowSelection()}
      />

      {editId && (
        <EditShortlinkSheet
          id={editId}
          open={!!editId}
          onOpenChange={(open) => {
            if (!open) setEditId(undefined);
          }}
          merchantsLite={merchantsLiteQuery.data ?? []}
        />
      )}

      {deleteId && deleteCode && (
        <DeleteShortlinkDialog
          id={deleteId}
          code={deleteCode}
          open={!!deleteId}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteId(undefined);
              setDeleteCode(undefined);
            }
          }}
        />
      )}
    </div>
  );
}

function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((filter) => filter.id === id)?.value as string | undefined;
}

function upsertFilter(filters: ColumnFiltersState, id: string, value?: string) {
  const next = filters.filter((filter) => filter.id !== id);
  if (!value) return next;
  return [...next, { id, value }];
}

type FilterOption = { value: string; label: string };

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  className?: string;
  disabled?: boolean;
}) {
  const normalizedValue = value ?? "all";

  const form = useForm<{ selection: string }>({
    defaultValues: { selection: normalizedValue },
  });

  React.useEffect(() => {
    form.reset({ selection: normalizedValue });
  }, [normalizedValue, form]);

  const selectOptions: FilterOption[] = [{ value: "all", label: placeholder }, ...options];

  const handleValueChange = React.useCallback(
    (next?: string) => {
      onChange(next ?? "all");
    },
    [onChange]
  );

  return (
    <FormProvider {...form}>
      <RHFSelect
        name="selection"
        label={placeholder}
        hideLabel
        className={className}
        options={selectOptions}
        disabled={disabled}
        onValueChange={handleValueChange}
      />
    </FormProvider>
  );
}
