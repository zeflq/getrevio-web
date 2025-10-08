// src/features/places/components/EditPlaceSheet.tsx
"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SheetForm } from "@/components/form/SheetForm";

import { placeUpdateSchema, type PlaceUpdateInput } from "../model/placeSchema";
import { usePlaceItem, useUpdatePlace } from "../hooks/usePlaceCrud";
import type { MerchantLite } from "@/features/merchants";
import { PlaceFormFields } from "./PlaceFormFields";

export interface EditPlaceSheetProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: MerchantLite[];
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
  const { data: place, isLoading } = usePlaceItem(id);
  const updatePlace = useUpdatePlace();

  const form = useForm<PlaceUpdateInput>({
    resolver: zodResolver(placeUpdateSchema),
    mode: "onChange",
    defaultValues: {
      localName: "",
      slug: "",
      address: "",
      merchantId: merchantId ?? "",
      googlePlaceId: "",
      landingDefaults: {
        title: "",
        subtitle: "",
        primaryCtaLabel: "",
        primaryCtaUrl: "",
        secondaryCtaLabel: "",
        secondaryCtaUrl: "",
      },
    },
  });

  const { reset, setValue } = form;

  useEffect(() => {
    if (!place) return;
    reset({
      localName: place.localName ?? "",
      address: place.address ?? "",
      merchantId: merchantId ?? place.merchantId ?? "",
      googlePlaceId: place.googlePlaceId ?? "",
      landingDefaults: place.landingDefaults ?? {},
      slug: place.slug, // read-only field still needs value in form state
    });
  }, [place, merchantId, reset]);

  useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, { shouldValidate: false, shouldDirty: false });
    }
  }, [merchantId, setValue]);

  const resetForm = () =>
    reset({
      localName: place?.localName ?? "",
      address: place?.address ?? "",
      merchantId: merchantId ?? place?.merchantId ?? "",
      googlePlaceId: "",
      landingDefaults: place?.landingDefaults ?? {},
      slug: place?.slug,
    });

  const onSubmit = async (data: PlaceUpdateInput) => {
    try {
      await updatePlace.mutateAsync({ id, input: data });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update place:", error);
    }
  };

  const handleSheetChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const isBusy = isLoading || updatePlace.isPending;
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
      <PlaceFormFields
        mode="edit"
        disabled={isBusy}
        merchantId={merchantId}
        merchantsLite={merchantsLite}
        existingSlug={place?.slug}
      />
    </SheetForm>
  );
}
