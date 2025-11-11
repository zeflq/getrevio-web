"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlacesList } from "@/features/places/hooks/usePlaceCrud";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import type { GooglePlaceRow } from "../types";

export type LinkPlaceToGoogleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  googlePlace?: GooglePlaceRow;
  onConfirm: (placeId: string) => Promise<void> | void;
  isBusy?: boolean;
};

export function LinkPlaceToGoogleDialog({
  open,
  onOpenChange,
  googlePlace,
  onConfirm,
  isBusy,
}: LinkPlaceToGoogleDialogProps) {
  const t = useTranslations("googlePlaces");
  const tenantId = useActiveTenantId();

  const pageSize = 50;
  const pageIndex = 0;
  const { data: placesResponse, isLoading } = usePlacesList({
    merchantId: tenantId,
    hasGooglePlaceId: false,
    _page: pageIndex + 1,
    _limit: pageSize,
    _sort: "createdAt",
    _order: "asc",
  });

  const rows = placesResponse?.data ?? [];
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (!selectedValue && rows.length) {
      setSelectedValue(rows[0].id);
    }
  }, [rows, selectedValue]);

  const handleConfirm = React.useCallback(async () => {
    if (!selectedValue) return;
    await onConfirm(selectedValue);
  }, [onConfirm, selectedValue]);

  const disabled = !tenantId || isBusy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link place</DialogTitle>
          <DialogDescription>
            Choose an internal place to associate with{' '}
            <strong>{googlePlace?.name ?? "this Google place"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="text-sm font-medium">Select a place</label>
          <Select value={selectedValue} onValueChange={(value) => setSelectedValue(value)} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading…" : "Select a place"} />
            </SelectTrigger>
            <SelectContent>
              {rows.map((place) => (
                <SelectItem key={place.id} value={place.id}>
                  {place.localName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isLoading && rows.length === 0 && (
            <p className="text-xs text-muted-foreground">{t("linkDialog.noUnlinkedPlaces")}</p>
          )}
          {!tenantId && (
            <p className="text-xs text-destructive">
              A tenant is required to link a Google place. Please select an organization first.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isBusy}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={disabled || !selectedValue}>
            {isBusy ? "Linking…" : "Link place"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
