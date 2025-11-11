"use client";

import * as React from "react";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useDataTableController } from "@/shared/ui/data-table/useDataTableController";
import { DataTableResponsive } from "@/shared/ui/data-table/DataTableResponsive";
import { DataTableToolbarBase } from "@/shared/ui/data-table/DataTableToolbarBase";
import { LinkPlaceToGoogleDialog } from "./LinkPlaceToGoogleDialog";
import { googlePlaceColumns } from "./columns";
import {
  useCreateFromGooglePlace,
  useGooglePlacesList,
  useLinkGooglePlace,
} from "../hooks/useGooglePlacesCrud";
import type { GooglePlaceRow } from "../types";
import type { PlaceCreateInput } from "@/features/places/model/placeSchema";

export function GooglePlacesTable() {
  const isMobile = useIsMobile();
  const tenantId = useActiveTenantId();
  const t = useTranslations("googlePlaces");
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [selectedGooglePlace, setSelectedGooglePlace] = React.useState<GooglePlaceRow | null>(null);

  const { execute: createFromGooglePlace } =
    useCreateFromGooglePlace<PlaceCreateInput, { ok: true }>({
      extraInvalidateKeys: [
        ["places", "list", { _page: 1, _limit: 10 }],
        ["places", "lite", {}],
      ],
    });
  const { execute: linkGooglePlace, isExecuting: isLinking } =
    useLinkGooglePlace<
      { id: string; merchantId: string; googlePlaceId: string },
      { ok: true }
    >({
      extraInvalidateKeys: [
        ["places", "list", { _page: 1, _limit: 10 }],
        ["places", "lite", {}],
      ],
      onSuccess: () => {
        setLinkDialogOpen(false);
        setSelectedGooglePlace(null);
      },
    });

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(() => (isMobile ? 5 : 10));
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "locationName", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    const next = isMobile ? 5 : 10;
    if (next !== pageSize) {
      setPageSize(next);
      setPageIndex(0);
    }
  }, [isMobile, pageSize]);

  const q = getFilterValue(columnFilters, "locationName");
  const sortId = (sorting[0]?.id as string | undefined) ?? "locationName";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data: placesResponse, isLoading } = useGooglePlacesList({
    q,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: sortId,
    _order: sortOrder,
  });

  const rows = placesResponse?.data ?? [];
  const totalPages = placesResponse?.totalPages ?? 1;
  const total = placesResponse?.total ?? 0;

  const handleLinkSelection = React.useCallback((place: GooglePlaceRow) => {
    setSelectedGooglePlace(place);
    setLinkDialogOpen(true);
  }, []);

  const handleLinkConfirm = React.useCallback(
    async (placeId: string) => {
      if (!selectedGooglePlace || !tenantId) return;
      await linkGooglePlace({
        id: placeId,
        merchantId: tenantId,
        googlePlaceId: selectedGooglePlace.googlePlaceId,
      });
    },
    [linkGooglePlace, selectedGooglePlace, tenantId]
  );

  const handleCreate = React.useCallback(
    (place: GooglePlaceRow) => {
      if (!tenantId) return;
      const address = place.address === "—" ? undefined : place.address;
      createFromGooglePlace({
        merchantId: tenantId,
        localName: place.name,
        address,
        googlePlaceId: place.googlePlaceId,
      });
    },
    [createFromGooglePlace, tenantId]
  );

  const columns = googlePlaceColumns({
    onLink: (placeId) => {
      const place = rows.find((row) => row.id === placeId);
      if (!place) return;
      handleLinkSelection(place);
    },
    onCreate: handleCreate,
    canLink: Boolean(tenantId),
    canCreate: Boolean(tenantId),
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
    // <DataTableToolbarBase
    //   table={controller.table}
    //   searchKey="locationName"
    //   searchPlaceholder="Search Google Places…"
    //   rightExtras={null}
    //   serverMode
    // />
    <></>
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <DataTableResponsive
        controller={controller}
        toolbar={toolbar}
        isLoading={isLoading}
        emptyText="No Google Places found."
        serverTotalRowsLabel={`${total} location(s)`}
        cardActionsColumnId="actionsMenu"
        cardExcludeColumnIds={[]}
        metaColsPerRow={2}
      />
      <LinkPlaceToGoogleDialog
        open={linkDialogOpen}
        onOpenChange={(next) => {
          setLinkDialogOpen(next);
          if (!next) {
            setSelectedGooglePlace(null);
          }
        }}
        googlePlace={selectedGooglePlace ?? undefined}
        onConfirm={handleLinkConfirm}
        isBusy={isLinking}
      />
    </div>
  );
}

function getFilterValue(filters: ColumnFiltersState, id: string) {
  return filters.find((f) => f.id === id)?.value as string | undefined;
}
