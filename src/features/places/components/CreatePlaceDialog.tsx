// src/features/places/components/CreatePlaceDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogForm } from "@/components/form/DialogForm";
import { placeCreateSchema, type PlaceCreateInput } from "../model/placeSchema";
import { useCreatePlace } from "../hooks/usePlaceCrud";
import type { LiteListe } from "@/types/lists";
import { usePlaceSlugCheck } from "../hooks/usePlaceSlugCheck";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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

  const { reset, setValue, watch } = methods;

  React.useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, { shouldValidate: true, shouldDirty: false });
    }
  }, [merchantId, setValue]);

  const resetForm = () =>
    reset({
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
    });

  const onSubmit = (data: PlaceCreateInput) => {
    execute(data);
  };

  // Slug availability (debounced)
  const slug = watch("slug");
  const [debouncedSlug, setDebouncedSlug] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSlug(slug ?? ""), 300);
    return () => clearTimeout(t);
  }, [slug]);

  const { data: slugCheck, isFetching: slugChecking } = usePlaceSlugCheck(
    debouncedSlug || undefined
  );
  const slugExists = !!slugCheck?.exists;

  const slugSuffix = slugChecking ? (
    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" aria-hidden="true" />
  ) : debouncedSlug ? (
    slugExists ? (
      <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
    )
  ) : null;

  const slugDescription =
    debouncedSlug && (slugExists ? "Slug already taken" : "Slug is available");

  // Provide children to the DialogForm via the Slot mechanism
  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <PlaceFormFields
      mode="create"
      disabled={isExecuting}
      merchantId={merchantId}
      merchantsLite={merchantsLite}
      slugSuffix={slugSuffix}
      slugDescription={slugDescription}
    />
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
