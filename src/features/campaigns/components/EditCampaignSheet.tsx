// src/features/campaigns/components/EditCampaignSheet.tsx
"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SheetForm } from "@/components/form/SheetForm";
import { CampaignFormFields } from "./CampaignFormFields";
import {
  campaignUpdateSchema,
  type CampaignUpdateInput,
} from "../model/campaignSchema";
import {
  useCampaignItem,
  useUpdateCampaign,
} from "../hooks/useCampaignCrud";
import { usePlacesLite } from "@/features/places";
import { LiteListe } from "@/types/lists";

export interface EditCampaignSheetProps {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
}

export function EditCampaignSheet({
  campaignId,
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
}: EditCampaignSheetProps) {
  const { data: campaign, isLoading } = useCampaignItem(campaignId);

  const { execute, isExecuting } = useUpdateCampaign<
    { id: string } & CampaignUpdateInput,
    { ok?: boolean }
  >({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const methods = useForm<CampaignUpdateInput>({
    resolver: zodResolver(campaignUpdateSchema),
    mode: "onChange",
    defaultValues: {
      merchantId: merchantId ?? "",
      placeId: "",
      name: "",
      slug: "",
      primaryCtaUrl: "",
      status: "draft",
      theme: { brandColor: "", logoUrl: "" },
    },
  });

  const { reset, setValue, watch } = methods;

  const resetToLoaded = React.useCallback(() => {
    if (!campaign) return;
    const theme = (campaign.theme ?? {}) as {
      brandColor?: string;
      logoUrl?: string;
    };
    reset({
      merchantId: merchantId ?? campaign.merchantId ?? "",
      placeId: campaign.placeId ?? "",
      name: campaign.name ?? "",
      slug: campaign.slug ?? "",
      primaryCtaUrl: campaign.primaryCtaUrl ?? "",
      status: campaign.status ?? "draft",
      theme: {
        brandColor: theme.brandColor ?? "",
        logoUrl: theme.logoUrl ?? "",
      },
    });
  }, [campaign, merchantId, reset]);

  useEffect(() => {
    if (campaign) {
      resetToLoaded();
    }
  }, [campaign, resetToLoaded]);

  useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [merchantId, setValue]);

  const merchantIdValue = watch("merchantId");

  const placesLiteQuery = usePlacesLite(
    { merchantId: merchantIdValue || undefined, _limit: 100 },
    { enabled: !!merchantIdValue }
  );

  const prevMerchantRef = useRef<string | null>(null);
  useEffect(() => {
    const current = merchantIdValue ?? null;
    if (prevMerchantRef.current === null) {
      prevMerchantRef.current = current;
      return;
    }
    if (prevMerchantRef.current !== current) {
      setValue("placeId", "", { shouldDirty: true, shouldValidate: false });
      prevMerchantRef.current = current;
    }
  }, [merchantIdValue, setValue]);

  useEffect(() => {
    if (!campaign?.placeId) return;
    const options = placesLiteQuery.data ?? [];
    const hasPlace = options.some(
      (p) => String(p.value) === String(campaign.placeId)
    );
    if (hasPlace) {
      setValue("placeId", String(campaign.placeId), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [campaign?.placeId, placesLiteQuery.data, setValue]);

  const onSubmit = (data: CampaignUpdateInput) => {
    const theme = data.theme;
    const payload: CampaignUpdateInput = {
      ...data,
      theme:
        theme && (theme.brandColor || theme.logoUrl)
          ? {
              brandColor: theme.brandColor || undefined,
              logoUrl: theme.logoUrl || undefined,
            }
          : undefined,
    };

    execute({ id: campaignId, ...payload });
  };

  const handleSheetChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetToLoaded();
    }
    onOpenChange(nextOpen);
  };

  const campaignLoaded = !!campaign && !isLoading;
  const merchantReady = !!merchantId || merchantsLite.length > 0;
  const placesRequired = !!merchantIdValue;
  const placesReady =
    !placesRequired ||
    (!placesLiteQuery.isLoading && !!placesLiteQuery.data);
  const selectedPlaceIsInOptions =
    !campaign?.placeId ||
    !placesRequired ||
    (placesLiteQuery.data ?? []).some(
      (p) => String(p.value) === String(campaign.placeId)
    );

  const formReady =
    campaignLoaded && merchantReady && placesReady && selectedPlaceIsInOptions;

  return (
    <SheetForm<CampaignUpdateInput>
      open={open}
      title="Edit Campaign"
      description="Update campaign information. Changes will be saved immediately."
      methods={methods}
      onOpenChange={handleSheetChange}
      onSubmit={onSubmit}
      isBusy={isExecuting}
      isReady={formReady}
      onCancel={resetToLoaded}
    >
      <CampaignFormFields
        disabled={isExecuting}
        merchantsLite={merchantsLite}
        merchantIdLocked={merchantId}
        placesLite={placesLiteQuery.data ?? []}
        placesLoading={placesLiteQuery.isLoading}
        merchantIdValue={merchantIdValue}
      />
    </SheetForm>
  );
}
