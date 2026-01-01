// src/features/landings/components/LandingFormFields.tsx
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";

import { RHFInput, RHFCombobox, RHFSelect } from "@/components/form/controls";
import { cn } from "@/lib/utils";
import type { LiteListe } from "@/types/lists";
import { usePlacesLite } from "@/features/places";
import { useCampaignsLite } from "@/features/campaigns";
import { useThemesLite } from "@/features/themes/hooks/useThemeCrud";

import type { LandingFormValues } from "../model/landingSchema";
import { getAllTemplatesForLocale } from "../templates";
import { Button } from "@/components/ui/button";

type FormShape = LandingFormValues;

type Props = {
  isEdit?: boolean;
  disabled?: boolean;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  slugSuffix?: React.ReactNode;
  slugDescription?: string;
  existingSlug?: string;
};

export function LandingFormFields({
  isEdit = false,
  disabled,
  merchantId,
  merchantsLite = [],
  slugSuffix,
  slugDescription,
  existingSlug,
}: Props) {
  const {
    register,
    setValue,
    watch,
  } = useFormContext<FormShape>();

  const selectedMerchantId = merchantId ?? watch("settings.merchantId");
  const belongsTo = watch("belongsTo");
  const attachmentType: "place" | "campaign" = belongsTo?.type ?? "place";
  const locale = useLocale();
  const t = useTranslations("landings.form");
  const t_tpl = useTranslations("landings.templates");
  const templates = React.useMemo(
    () => getAllTemplatesForLocale(locale),
    [locale]
  );

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
  const campaignsLite = campaignsLiteQuery.data ?? [];
  const campaignsLoading = campaignsLiteQuery.isLoading;
  const themesLiteQuery = useThemesLite(
    selectedMerchantId ? { merchantId: selectedMerchantId } : {},
    { enabled: Boolean(selectedMerchantId) }
  );
  const themesLite = themesLiteQuery.data ?? [];
  const themesLoading = themesLiteQuery.isLoading;

  return (
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

      <RHFInput
        name="settings.slug"
        label={t("slug")}
        placeholder={isEdit ? existingSlug ?? "" : t("slugPlaceholder")}
        description={isEdit ? t("slugLocked") : slugDescription}
        requiredStar
        disabled={disabled || isEdit}
        suffix={slugSuffix}
      />
      <RHFCombobox<LiteListe>
        name="templateId"
        label={t("template")}
        options={templates.map((tpl) => ({ value: tpl.id, label: tpl.meta?.name }))}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        placeholder={t("templatePlaceholder")}
        disabled={disabled || isEdit}
        keyBy={`template-${selectedMerchantId}`}
      />
      <RHFCombobox<LiteListe>
        name="themeId"
        label={t("theme")}
        options={themesLite}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        placeholder={t("themePlaceholder")}
        disabled={disabled || !selectedMerchantId || themesLoading}
        loading={themesLoading}
        keyBy={`theme-${selectedMerchantId}`}
        valueIsNullable
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
            <Button
              key={type}
              className={cn(
                "flex-1 transition",
                attachmentType === type
                  ? "bg-primary/10"
                  : "border-muted-foreground/20 text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary "
              )}
              variant={ 
                attachmentType === type ? "primaryOutline" : "outline"
              }
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
            </Button>
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
}
