// src/features/landings/components/LandingFormFields.tsx
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { RHFInput, RHFSelect, RHFCombobox } from "@/components/form/controls";
import { cn } from "@/lib/utils";
import type { LiteListe } from "@/types/lists";
import { usePlacesLite } from "@/features/places";
import { useCampaignsLite } from "@/features/campaigns";
import type { CampaignLiteItem } from "@/features/campaigns/server/application/interfaces/campaignQueryRepository";

import type { LandingCreateFormValues, LandingFormValues } from "../model/landingSchema";

type FormShape = LandingFormValues | LandingCreateFormValues;

type Props = {
  disabled?: boolean;
  merchantId?: string;
  merchantsLite?: LiteListe[];
};

export function LandingFormFields({
  disabled,
  merchantId,
  merchantsLite = [],
}: Props) {
  const {
    register,
    setValue,
    watch,
  } = useFormContext<FormShape>();

  const selectedMerchantId = merchantId ?? watch("settings.merchantId");
  const belongsTo = watch("belongsTo");
  const attachmentType: "place" | "campaign" = belongsTo?.type ?? "place";
  const t = useTranslations("landings.form");

  const previousMerchantId = React.useRef<string | undefined>(selectedMerchantId);

  React.useEffect(() => {
    if (previousMerchantId.current === selectedMerchantId) return;
    previousMerchantId.current = selectedMerchantId;

    if (attachmentType === "place") {
      setValue("belongsTo.placeId", "", { shouldDirty: true, shouldValidate: false });
    } else {
      setValue("belongsTo.campaignId", "", { shouldDirty: true, shouldValidate: false });
    }
  }, [attachmentType, selectedMerchantId, setValue]);

  const { data: placesLite = [], isLoading: placesLoading } = usePlacesLite(
    selectedMerchantId ? { merchantId: selectedMerchantId } : {}
  );
  const campaignsLiteQuery = useCampaignsLite(
    selectedMerchantId ? { merchantId: selectedMerchantId } : {}
  );
  const campaignsLite = (campaignsLiteQuery.data ?? []) as CampaignLiteItem[];
  const campaignsLoading = campaignsLiteQuery.isLoading;

  const settingsSection = (
    <div className="space-y-4">
      {!merchantId ? (
        <RHFCombobox<LiteListe>
          name="settings.merchantId"
          label={t("merchant")}
          options={merchantsLite}
          getOptionValue={(m) => m.value}
          getOptionLabel={(m) => m.label}
          placeholder={t("merchantPlaceholder")}
          searchPlaceholder={t("merchantSearch")}
          requiredStar
          disabled={disabled}
        />
      ) : (
        <input type="hidden" {...register("settings.merchantId")} value={merchantId} />
      )}

      <RHFInput
        name="settings.name"
        label={t("name")}
        placeholder={t("namePlaceholder")}
        requiredStar
        disabled={disabled}
      />

      <RHFSelect
        name="settings.status"
        label={t("status")}
        options={[
          { value: "draft", label: t("statusDraft") },
          { value: "published", label: t("statusPublished") },
          { value: "archived", label: t("statusArchived") },
        ]}
        placeholder={t("status")}
        disabled={disabled}
      />

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            {t("attachmentLabel")} <span className="text-destructive">*</span>
          </p>
          <p className="text-xs text-muted-foreground">{t("attachmentDescription")}</p>
        </div>

        <div className="flex gap-2">
          {(["place", "campaign"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition",
                attachmentType === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/50"
              )}
              aria-pressed={attachmentType === type}
              onClick={() => {
                if (type === attachmentType) return;
                if (type === "place") {
                  setValue("belongsTo", { type: "place", placeId: "" }, { shouldDirty: true, shouldValidate: true });
                } else {
                  setValue("belongsTo", { type: "campaign", campaignId: "" }, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
              disabled={disabled}
            >
              {type === "place" ? t("attachmentPlace") : t("attachmentCampaign")}
            </button>
          ))}
        </div>

        {attachmentType === "place" ? (
          <RHFCombobox<LiteListe>
            name="belongsTo.placeId"
            label={t("attachmentPlace")}
            options={placesLite}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            placeholder={
              selectedMerchantId ? t("placePlaceholder") : t("selectMerchantFirst")
            }
            searchPlaceholder={t("placeSearch")}
            requiredStar
            disabled={disabled || !selectedMerchantId || placesLoading}
            loading={placesLoading}
            keyBy={`place-${selectedMerchantId}`}
          />
        ) : (
          <RHFCombobox<LiteListe>
            name="belongsTo.campaignId"
            label={t("attachmentCampaign")}
            options={campaignsLite}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            placeholder={
              selectedMerchantId ? t("campaignPlaceholder") : t("selectMerchantFirst")
            }
            searchPlaceholder={t("campaignSearch")}
            requiredStar
            disabled={disabled || !selectedMerchantId || campaignsLoading}
            loading={campaignsLoading}
            keyBy={`campaign-${selectedMerchantId}`}
          />
        )}

      </div>
    </div>
  );

  return <div className="space-y-6">{settingsSection}</div>;
}
