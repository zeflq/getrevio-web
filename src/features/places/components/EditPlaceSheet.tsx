// src/features/places/components/EditPlaceSheet.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SheetForm } from "@/components/form/SheetForm";

import { placeUpdateSchema, type PlaceUpdateInput } from "../model/placeSchema";
import { usePlaceItem, useUpdatePlace } from "../hooks/usePlaceCrud";
import type { LiteListe } from "@/types/lists";
import { PlaceFormFields } from "./PlaceFormFields";

export interface EditPlaceSheetProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
}

export function EditPlaceSheet({
  id,
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
}: EditPlaceSheetProps) {
  // Only fetch when sheet is open and ID exists
  const { data: place, isLoading } = usePlaceItem(open && id ? id : undefined);
  const { mutateAsync, isPending } = useUpdatePlace<
    { id: string } & PlaceUpdateInput,
    { ok?: boolean }
  >({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const form = useForm<PlaceUpdateInput>({
    resolver: zodResolver(placeUpdateSchema),
    mode: "onChange",
    values: place ? {
      localName: place.localName ?? "",
      address: place.address ?? "",
      merchantId: merchantId ?? place.merchantId ?? "",
    } : undefined,
    defaultValues: {
      localName: "",
      address: "",
      merchantId: merchantId ?? "",
    },
  });

  const { reset } = form;

  const resetForm = () =>
    reset({
      localName: place?.localName ?? "",
      address: place?.address ?? "",
      merchantId: merchantId ?? place?.merchantId ?? "",
    });

  const onSubmit = (data: PlaceUpdateInput) => {
    mutateAsync({ id, ...data });
  };

  const handleSheetChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const isBusy = isLoading || isPending;
  const isReady = !!place && !isLoading;

  return (
    <SheetForm<PlaceUpdateInput>
      open={open}
      title="Edit Place"
      description="Update place information. Changes will be saved immediately."
      methods={form}
      onOpenChange={handleSheetChange}
      onSubmit={onSubmit}
      isBusy={isBusy}
      isReady={isReady}
      onCancel={resetForm}
    >
      <PlaceFormFields disabled={isBusy} merchantId={merchantId} merchantsLite={merchantsLite} />
    </SheetForm>
  );
}
