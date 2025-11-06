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
import { useThemesLite } from "@/features/themes";
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

  /** Optional pre-fetched theme list */
  themesLite?: LiteListe[];
  themesLoading?: boolean;
  showThemeSelect?: boolean;
}

export function CreateCampaignDialog({
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
  themesLite,
  themesLoading,
  showThemeSelect: showThemeSelectOverride,
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
      status: "draft",
      themeId: "",
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

  const hasExternalThemes = Array.isArray(themesLite);
  const themesLiteQuery = useThemesLite(
    { merchantId: merchantIdValue || undefined, _limit: 100 },
    { enabled: !hasExternalThemes && !!merchantIdValue }
  );
  const resolvedThemesLite = hasExternalThemes ? themesLite ?? [] : themesLiteQuery.data ?? [];
  const resolvedThemesLoading = hasExternalThemes ? themesLoading ?? false : themesLiteQuery.isLoading;

  // Reset placeId whenever merchant changes to avoid stale selection
  React.useEffect(() => {
    setValue("placeId", "", { shouldDirty: true, shouldValidate: true });
  }, [merchantIdValue, setValue]);

  // Reset themeId whenever merchant changes; auto-select when only one
  React.useEffect(() => {
    if (resolvedThemesLoading) return;

    if (!merchantIdValue) {
      setValue("themeId", "", { shouldDirty: false, shouldValidate: false });
      return;
    }
    const themes = resolvedThemesLite;
    const currentThemeId = methods.getValues("themeId") ?? "";

    if (themes.length === 0) {
      if (currentThemeId !== "") {
        setValue("themeId", "", { shouldDirty: false, shouldValidate: false });
      }
      return;
    }

    if (themes.length === 1) {
      if (currentThemeId !== themes[0].value) {
        setValue("themeId", themes[0].value, { shouldDirty: false, shouldValidate: false });
      }
      return;
    }

    const existsInOptions = themes.some((theme) => theme.value === currentThemeId);
    if (!existsInOptions) {
      setValue("themeId", "", { shouldDirty: false, shouldValidate: false });
    }
  }, [merchantIdValue, resolvedThemesLite, resolvedThemesLoading, setValue, methods]);

  const resetForm = React.useCallback(
    () =>
      reset({
        merchantId: merchantId ?? "",
        placeId: "",
        name: "",
        status: "draft",
        themeId: "",
      }),
    [merchantId, reset]
  );

  const onSubmit = (data: CampaignCreateInput) => {
    const normalizedThemeId =
      typeof data.themeId === "string" && data.themeId.trim().length > 0
        ? data.themeId.trim()
        : undefined;

    const payload: CampaignCreateInput = {
      ...data,
      themeId: normalizedThemeId,
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
  const showThemeSelect =
    showThemeSelectOverride ?? ((resolvedThemesLite?.length ?? 0) > 1);

  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <CampaignFormFields
      disabled={isExecuting}
      merchantsLite={merchantsLite}
      merchantIdLocked={merchantId}
      placesLite={placesLiteQuery.data ?? []}
      placesLoading={placesLiteQuery.isLoading}
      merchantIdValue={merchantIdValue}
      themesLite={resolvedThemesLite}
      themesLoading={resolvedThemesLoading}
      showThemeSelect={showThemeSelect}
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
