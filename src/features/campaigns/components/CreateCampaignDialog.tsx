// src/features/campaigns/components/CreateCampaignDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogForm } from "@/components/form/DialogForm";
import { CampaignFormFields } from "./CampaignFormFields";
import {
  campaignCreateSchema,
  type CampaignCreateInput,
} from "../model/campaignSchema";
import { useCreateCampaign } from "../hooks/useCampaignCrud";
import type { LiteListe } from "@/types/lists";
import { usePlacesLite } from "@/features/places";

export interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** When provided, the merchant select is hidden & value is fixed */
  merchantId?: string;

  /** List to render in the select (admin flow) */
  merchantsLite?: LiteListe[];

  /** Optional callback after successful creation */
  onSuccess?: () => void;
}

export function CreateCampaignDialog({
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
}: CreateCampaignDialogProps) {
  const { execute, isExecuting } = useCreateCampaign<
    CampaignCreateInput,
    { id?: string }
  >({
    onSuccess: () => {
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const methods = useForm<CampaignCreateInput>({
    resolver: zodResolver(campaignCreateSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      merchantId: merchantId ?? "",
      placeId: "",
      name: "",
      primaryCtaUrl: "",
      status: "draft",
      theme: { brandColor: "", logoUrl: "" },
    },
  });

  const { reset, setValue, watch } = methods;

  // Keep form's merchantId synced if prop changes
  React.useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [merchantId, setValue]);

  // Current merchant selection from the form
  const merchantIdValue = watch("merchantId");

  // Fetch places filtered by merchant (disabled until a merchant is chosen)
  const placesLiteQuery = usePlacesLite(
    { merchantId: merchantIdValue || undefined, _limit: 100 },
    { enabled: !!merchantIdValue }
  );

  // Reset placeId whenever merchant changes to avoid stale selection
  React.useEffect(() => {
    setValue("placeId", "", { shouldDirty: true, shouldValidate: true });
  }, [merchantIdValue, setValue]);

  const resetForm = React.useCallback(
    () =>
      reset({
        merchantId: merchantId ?? "",
        placeId: "",
        name: "",
        primaryCtaUrl: "",
        status: "draft",
        theme: { brandColor: "", logoUrl: "" },
      }),
    [merchantId, reset]
  );

  const onSubmit = (data: CampaignCreateInput) => {
    const theme = data.theme;
    const payload: CampaignCreateInput = {
      ...data,
      theme:
        theme && (theme.brandColor || theme.logoUrl)
          ? {
              brandColor: theme.brandColor || undefined,
              logoUrl: theme.logoUrl || undefined,
            }
          : undefined,
    };

    execute(payload);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const merchantReady = !!merchantId || merchantsLite.length > 0;

  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <CampaignFormFields
      disabled={isExecuting}
      merchantsLite={merchantsLite}
      merchantIdLocked={merchantId}
      placesLite={placesLiteQuery.data ?? []}
      placesLoading={placesLiteQuery.isLoading}
      merchantIdValue={merchantIdValue}
    />
  );

  return (
    <DialogForm<CampaignCreateInput>
      open={open}
      onOpenChange={handleOpenChange}
      title="Create Campaign"
      description="Create a new campaign. Fill in the required information below."
      methods={methods}
      onSubmit={onSubmit}
      isBusy={isExecuting}
      isReady={merchantReady}
      onCancel={resetForm}
      submitLabel={isExecuting ? "Creating..." : "Create Campaign"}
      className="sm:max-w-[560px]"
    />
  );
}

// no changes needed
