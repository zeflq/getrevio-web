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
import { usePlacesLite } from "@/features/places";
import type { LiteListe } from "@/types/lists";

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
  const { mutateAsync, isPending } = useCreateCampaign({
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
      status: "draft",
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
    { merchantId: merchantIdValue || undefined, _limit: 10 },
    { enabled: !!merchantIdValue }
  );

  // Reset placeId whenever merchant changes to avoid stale selection
  React.useEffect(() => {
    setValue("placeId", "", { shouldDirty: false, shouldValidate: false });
  }, [merchantIdValue, setValue]);

  const resetForm = React.useCallback(
    () =>
      reset({
        merchantId: merchantId ?? "",
        placeId: "",
        name: "",
        status: "draft",
      }),
    [merchantId, reset]
  );

  const onSubmit = (data: CampaignCreateInput) => {
    mutateAsync(data);
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
      disabled={isPending}
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
      isBusy={isPending}
      isReady={merchantReady}
      onCancel={resetForm}
      submitLabel={isPending ? "Creating..." : "Create Campaign"}
      className="sm:max-w-[560px]"
    />
  );
}

// no changes needed
