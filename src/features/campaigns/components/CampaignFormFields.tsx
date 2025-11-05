// src/features/campaigns/components/CampaignFormFields.tsx
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import {
  RHFCombobox,
  RHFInput,
  RHFSelect,
} from "@/components/form/controls";
import type { LiteListe } from "@/types/lists";

type Props = {
  disabled?: boolean;
  merchantsLite?: LiteListe[];
  merchantIdLocked?: string;
  placesLite?: LiteListe[];
  placesLoading?: boolean;
  merchantIdValue?: string;
  themesLite?: LiteListe[];
  themesLoading?: boolean;
  showThemeSelect?: boolean;
};

export function CampaignFormFields({
  disabled,
  merchantsLite = [],
  merchantIdLocked,
  placesLite = [],
  placesLoading,
  merchantIdValue,
  themesLite = [],
  themesLoading = false,
  showThemeSelect = false,
}: Props) {
  const form = useFormContext();

  const themeOptions = React.useMemo(() => {
    const base: LiteListe[] = [{ value: "", label: "No theme" }];
    return base.concat(themesLite);
  }, [themesLite]);

  return (
    <div className="space-y-4">
      {!merchantIdLocked ? (
        <RHFCombobox<LiteListe>
          name="merchantId"
          label="Merchant"
          options={merchantsLite}
          getOptionValue={(m) => m.value}
          getOptionLabel={(m) => m.label}
          placeholder="Select merchant…"
          searchPlaceholder="Search merchants…"
          disabled={disabled}
          requiredStar
        />
      ) : (
        <input type="hidden" {...form.register("merchantId")} value={merchantIdLocked} />
      )}

      <RHFCombobox<LiteListe>
        name="placeId"
        label="Place"
        options={placesLite}
        getOptionValue={(p) => p.value}
        getOptionLabel={(p) => p.label}
        placeholder={merchantIdValue ? "Select place…" : "Select merchant first"}
        searchPlaceholder="Search places…"
        disabled={disabled || !merchantIdValue || placesLoading}
        loading={placesLoading}
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
        name="primaryCtaUrl"
        label="Primary CTA URL"
        placeholder="https://example.com/book-now"
        disabled={disabled}
        requiredStar
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

      {showThemeSelect ? (
        <RHFCombobox<LiteListe>
          name="themeId"
          label="Theme"
          options={themeOptions}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          placeholder="Select theme…"
          searchPlaceholder="Search themes…"
          disabled={disabled || themesLoading}
          loading={themesLoading}
          keyBy={merchantIdValue}
        />
      ) : (
        <input type="hidden" {...form.register("themeId")} />
      )}
    </div>
  );
}
