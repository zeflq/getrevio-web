// src/features/places/components/CreatePlaceDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogForm } from "@/components/form/DialogForm";
import { placeCreateSchema, type PlaceCreateInput } from "../model/placeSchema";
import { useCreatePlace } from "../hooks/usePlaceCrud";
import type { LiteListe } from "@/types/lists";
import { PlaceFormFields } from "./PlaceFormFields";

export interface CreatePlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
}

export function CreatePlaceDialog({
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
}: CreatePlaceDialogProps) {
  const { execute, isExecuting } = useCreatePlace<PlaceCreateInput, { id?: string }>({
    onSuccess: () => {
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const methods = useForm<PlaceCreateInput>({
    resolver: zodResolver(placeCreateSchema),
    mode: "onChange",
    defaultValues: {
      localName: "",
      address: "",
      merchantId: merchantId ?? "",
    },
  });

  const { reset, setValue } = methods;

  React.useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, { shouldValidate: true, shouldDirty: false });
    }
  }, [merchantId, setValue]);

  const resetForm = () =>
    reset({
      localName: "",
      address: "",
      merchantId: merchantId ?? "",
    });

  const onSubmit = (data: PlaceCreateInput) => {
    execute(data);
  };

  // Slug availability (debounced)
  // Provide children to the DialogForm via the Slot mechanism
  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <PlaceFormFields disabled={isExecuting} merchantId={merchantId} merchantsLite={merchantsLite} />
  );

  return (
    <DialogForm<PlaceCreateInput>
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
      title="Create Place"
      description="Add a new place. Fill in the required information below."
      methods={methods}
      onSubmit={onSubmit}
      isBusy={isExecuting}
      isReady={true}
      submitLabel={isExecuting ? "Creating..." : "Create Place"}
    />
  );
}
