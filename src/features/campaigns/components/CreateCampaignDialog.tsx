// src/features/campaigns/components/CreateCampaignDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Form } from "@/components/ui/form";
import { RHFInput, RHFSelect, RHFCombobox } from "@/components/form/controls";

import { campaignCreateSchema, type CampaignCreateInput } from "../model/campaignSchema";
import { useCreateCampaign } from "../hooks/useCampaignCrud";

import type { MerchantLite } from "@/features/merchants";
import { PlaceLite, usePlacesLite } from "@/features/places";

export interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** When provided, the merchant select is hidden & value is fixed */
  merchantId?: string;

  /** List to render in the select (admin flow) */
  merchantsLite?: MerchantLite[];

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
  const createCampaign = useCreateCampaign();

  const form = useForm<CampaignCreateInput>({
    resolver: zodResolver(campaignCreateSchema),
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

  // Keep form's merchantId synced if prop changes
  React.useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, { shouldValidate: true, shouldDirty: false });
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

  const resetForm = () =>
    reset({
      merchantId: merchantId ?? "",
      placeId: "",
      name: "",
      slug: "",
      primaryCtaUrl: "",
      status: "draft",
      theme: { brandColor: "", logoUrl: "" },
    });

  const onSubmit = async (data: CampaignCreateInput) => {
    try {
      const theme = data.theme;
      const cleaned: CampaignCreateInput = {
        ...data,
        theme:
          theme && (theme.brandColor || theme.logoUrl)
            ? {
                brandColor: theme.brandColor || undefined,
                logoUrl: theme.logoUrl || undefined,
              }
            : undefined,
      };

      await createCampaign.mutateAsync(cleaned);
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const disabled = createCampaign.isPending;

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Create a new campaign. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Merchant */}
            {!merchantId ? (
              <RHFCombobox<MerchantLite>
                name="merchantId"
                label="Merchant"
                options={merchantsLite}
                getOptionValue={(m) => m.id}
                getOptionLabel={(m) => m.name}
                placeholder="Select merchant"
                searchPlaceholder="Search merchants…"
                disabled={disabled}
                requiredStar
              />
            ) : (
              <input type="hidden" {...form.register("merchantId")} value={merchantId} />
            )}

            {/* Place (depends on merchant) */}
            <RHFCombobox<PlaceLite>
              name="placeId"
              label="Place"
              options={placesLiteQuery.data ?? []}
              getOptionValue={(p) => p.id}
              getOptionLabel={(p) => p.localName}
              placeholder={merchantIdValue ? "Select place…" : "Select merchant first"}
              searchPlaceholder="Search places…"
              disabled={disabled || !merchantIdValue || placesLiteQuery.isLoading}
              loading={placesLiteQuery.isLoading}
              keyBy={merchantIdValue}
              requiredStar
            />

            <RHFInput
              name="name"
              label="Name"
              placeholder="Summer Promo"
              disabled={disabled}
              requiredStar
            />

            <RHFInput
              name="slug"
              label="Slug"
              placeholder="summer-promo"
              disabled={disabled}
              requiredStar
            />

            <RHFInput
              name="primaryCtaUrl"
              label="Primary CTA URL"
              placeholder="https://example.com/book-now"
              disabled={disabled}
              requiredStar
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={disabled}>
                {disabled ? "Creating..." : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
