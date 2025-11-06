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
import { useCampaignItem, useUpdateCampaign } from "../hooks/useCampaignCrud";
import { usePlacesLite } from "@/features/places";
import { useThemesLite } from "@/features/themes";
import type { LiteListe } from "@/types/lists";

export interface EditCampaignSheetProps {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
  themesLite?: LiteListe[];
  themesLoading?: boolean;
  showThemeSelect?: boolean;
}

export function EditCampaignSheet({
  campaignId,
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
  themesLite,
  themesLoading,
  showThemeSelect: showThemeSelectOverride,
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
      status: "draft",
      themeId: "",
    },
  });

  const { reset, setValue, watch } = methods;

  const resetToLoaded = React.useCallback(() => {
    if (!campaign) return;
    reset({
      merchantId: merchantId ?? campaign.merchantId ?? "",
      placeId: campaign.placeId ?? "",
      name: campaign.name ?? "",
      status: campaign.status ?? "draft",
      themeId: campaign.themeId ?? "",
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

  const hasExternalThemes = Array.isArray(themesLite);
  const themesLiteQuery = useThemesLite(
    { merchantId: merchantIdValue || undefined, _limit: 100 },
    { enabled: !hasExternalThemes && !!merchantIdValue }
  );
  const resolvedThemesLite = hasExternalThemes ? themesLite ?? [] : themesLiteQuery.data ?? [];
  const resolvedThemesLoading = hasExternalThemes ? themesLoading ?? false : themesLiteQuery.isLoading;

  const prevMerchantRef = useRef<string | null>(null);
  useEffect(() => {
    const current = merchantIdValue ?? null;
    if (prevMerchantRef.current === null) {
      prevMerchantRef.current = current;
      return;
    }
    if (prevMerchantRef.current !== current) {
      setValue("placeId", "", { shouldDirty: true, shouldValidate: false });
      setValue("themeId", "", { shouldDirty: true, shouldValidate: false });
      prevMerchantRef.current = current;
    }
  }, [merchantIdValue, setValue]);

  useEffect(() => {
    if (!campaign?.placeId) return;
    const options = placesLiteQuery.data ?? [];
    const hasPlace = options.some((p) => String(p.value) === String(campaign.placeId));
    if (hasPlace) {
      setValue("placeId", String(campaign.placeId), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [campaign?.placeId, placesLiteQuery.data, setValue]);

  useEffect(() => {
    if (resolvedThemesLoading) return;

    const themes = resolvedThemesLite;
    const currentThemeId = methods.getValues("themeId") ?? "";

    if (!merchantIdValue) {
      if (currentThemeId !== "") {
        setValue("themeId", "", { shouldDirty: false, shouldValidate: false });
      }
      return;
    }

    if (themes.length === 0) {
      if (currentThemeId !== "") {
        setValue("themeId", "", { shouldDirty: false, shouldValidate: false });
      }
      return;
    }

    if (themes.length === 1) {
      const nextThemeId = themes[0]?.value ?? "";
      if (currentThemeId !== nextThemeId) {
        setValue("themeId", nextThemeId, { shouldDirty: false, shouldValidate: false });
      }
      return;
    }

    const existsInOptions = themes.some((theme) => theme.value === currentThemeId);
    if (!existsInOptions) {
      setValue("themeId", campaign?.themeId ?? "", { shouldDirty: false, shouldValidate: false });
    }
  }, [
    merchantIdValue,
    resolvedThemesLite,
    resolvedThemesLoading,
    setValue,
    campaign?.themeId,
    methods,
  ]);

  const onSubmit = (data: CampaignUpdateInput) => {
    let themeId: string | null | undefined = data.themeId;
    if (typeof data.themeId === "string") {
      const trimmed = data.themeId.trim();
      themeId = trimmed.length > 0 ? trimmed : null;
    }

    const payload: CampaignUpdateInput = {
      ...data,
      themeId,
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
    !placesRequired || (!placesLiteQuery.isLoading && !!placesLiteQuery.data);
  const selectedPlaceIsInOptions =
    !campaign?.placeId ||
    !placesRequired ||
    (placesLiteQuery.data ?? []).some((p) => String(p.value) === String(campaign.placeId));
  const formReady = campaignLoaded && merchantReady && placesReady && selectedPlaceIsInOptions;

  const resolvedShowThemeSelect =
    showThemeSelectOverride ?? ((resolvedThemesLite?.length ?? 0) > 1);

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
        themesLite={resolvedThemesLite}
        themesLoading={resolvedThemesLoading}
        showThemeSelect={resolvedShowThemeSelect}
      />
    </SheetForm>
  );
}
