"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  RHFInput,
  RHFSelect,
  RHFCombobox,
} from "@/components/form/controls";

import {
  campaignUpdateSchema,
  type CampaignUpdateInput,
} from "../model/campaignSchema";
import {
  useCampaignItem,
  useUpdateCampaign,
} from "../hooks/useCampaignCrud";

import type { MerchantLite } from "@/features/merchants";
import { usePlacesLite, type PlaceLite } from "@/features/places";
import { SheetForm } from "@/components/form/SheetForm";

export interface EditCampaignSheetProps {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** When provided, the merchant select is hidden & value is fixed */
  merchantId?: string;

  /** List to render in the merchant select (admin flow) */
  merchantsLite?: MerchantLite[];

  /** Optional callback after successful save */
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
  const updateCampaign = useUpdateCampaign();

  const form = useForm<CampaignUpdateInput>({
    resolver: zodResolver(campaignUpdateSchema),
    mode: "onChange",
    reValidateMode: "onChange",
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

  const { reset, setValue, watch } = form;

  // Load campaign data into the form
  useEffect(() => {
    if (!campaign) return;
    reset({
      merchantId: merchantId ?? campaign.merchantId ?? "",
      placeId: campaign.placeId ?? "",
      name: campaign.name ?? "",
      slug: campaign.slug ?? "",
      primaryCtaUrl: campaign.primaryCtaUrl ?? "",
      status: (campaign.status as any) ?? "draft",
      theme: {
        brandColor: campaign.theme?.brandColor ?? "",
        logoUrl: campaign.theme?.logoUrl ?? "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign, merchantId]);

  // If merchant is fixed by prop, keep it synced in the form
  useEffect(() => {
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

  // Only clear placeId when the MERCHANT actually changes after first load
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

  // After places load, confirm/set the campaign's placeId if present
  useEffect(() => {
    if (!campaign?.placeId) return;
    const list = placesLiteQuery.data ?? [];
    const has = list.some((p) => String(p.id) === String(campaign.placeId));
    if (has) {
      setValue("placeId", String(campaign.placeId), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [campaign?.placeId, placesLiteQuery.data, setValue]);

  const resetForm = () =>
    reset({
      merchantId: merchantId ?? campaign?.merchantId ?? "",
      placeId: campaign?.placeId ?? "",
      name: campaign?.name ?? "",
      slug: campaign?.slug ?? "",
      primaryCtaUrl: campaign?.primaryCtaUrl ?? "",
      status: (campaign?.status as any) ?? "draft",
      theme: {
        brandColor: campaign?.theme?.brandColor ?? "",
        logoUrl: campaign?.theme?.logoUrl ?? "",
      },
    });

  const onSubmit = async (data: CampaignUpdateInput) => {
    try {
      const theme = data.theme;
      const cleaned: CampaignUpdateInput = {
        ...data,
        theme:
          theme && (theme.brandColor || theme.logoUrl)
            ? {
                brandColor: theme.brandColor || undefined,
                logoUrl: theme.logoUrl || undefined,
              }
            : undefined,
      };

      await updateCampaign.mutateAsync({ id: campaignId, input: cleaned });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update campaign:", error);
    }
  };

  const handleSheetChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const disabled = isLoading || updateCampaign.isPending;

  // ----------------- Gating
  const campaignLoaded = !!campaign && !isLoading;
  const merchantReady = !!merchantId || merchantsLite.length > 0;

  const placesRequired = !!merchantIdValue;
  const placesReady =
    !placesRequired || (!placesLiteQuery.isLoading && !!placesLiteQuery.data);

  const selectedPlaceIsInOptions =
    !campaign?.placeId ||
    !placesRequired ||
    (placesLiteQuery.data ?? []).some(
      (p) => String(p.id) === String(campaign!.placeId)
    );

  const formReady =
    campaignLoaded && merchantReady && placesReady && selectedPlaceIsInOptions;
  // ----------------------------------------------------------------------

  return (
    <SheetForm<CampaignUpdateInput>
      open={open}
      title="Edit Campaign"
      description="Update campaign information. Changes will be saved immediately."
      methods={form}
      onOpenChange={handleSheetChange}
      onSubmit={onSubmit}
      isBusy={disabled}
      isReady={formReady}
      onCancel={resetForm}
    >
      {/* Skeleton while loading (kept identical to your original gating) */}
      {!formReady ? (
        <div className="space-y-4 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Merchant (genericCombobox when not locked by prop) */}
          {!merchantId ? (
            <RHFCombobox<MerchantLite>
              name="merchantId"
              label="Merchant"
              options={merchantsLite}
              getOptionValue={(m) => String(m.id)}
              getOptionLabel={(m) => m.name}
              placeholder="Select merchant…"
              searchPlaceholder="Search merchants…"
              disabled={disabled}
            />
          ) : (
            // Keep merchantId in form with a hidden input so RHF state stays consistent
            <input type="hidden" {...form.register("merchantId")} value={merchantId} />
          )}

          {/* Place (genericCombobox filtered by selected merchant) */}
          <RHFCombobox<PlaceLite>
            name="placeId"
            label="Place"
            options={placesLiteQuery.data ?? []}
            getOptionValue={(p) => String(p.id)}
            getOptionLabel={(p) => p.localName /* or p.name */}
            placeholder={merchantIdValue ? "Select place…" : "Select merchant first"}
            searchPlaceholder="Search places…"
            disabled={disabled || !merchantIdValue || placesLiteQuery.isLoading}
            loading={placesLiteQuery.isLoading}
            keyBy={merchantIdValue}
          />

          <RHFInput
            name="name"
            label="Name"
            placeholder="Summer Promo"
            disabled={disabled}
          />

          <RHFInput
            name="slug"
            label="Slug"
            placeholder="summer-promo"
            disabled={disabled}
          />

          <RHFInput
            name="primaryCtaUrl"
            label="Primary CTA URL"
            placeholder="https://example.com/book-now"
            disabled={disabled}
          />

          <RHFSelect
            name="status"
            label="Status"
            options={[
              { value: "draft", label: "Draft" },
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ]}
            placeholder="Select status"
            disabled={disabled}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RHFInput
              name="theme.brandColor"
              label="Brand Color (optional)"
              placeholder="#FF5733"
              disabled={disabled}
            />
            <RHFInput
              name="theme.logoUrl"
              label="Logo URL (optional)"
              placeholder="https://example.com/logo.png"
              disabled={disabled}
            />
          </div>

          {/* Footer buttons are provided by SheetForm; these are extra actions if you want them
              If you prefer only the SheetForm buttons, remove this block. */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSheetChange(false)}
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={disabled}>
              {updateCampaign.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </SheetForm>
  );
}
