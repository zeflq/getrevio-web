// src/features/places/components/PlaceFormFields.tsx
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { RHFInput, RHFCombobox } from "@/components/form/controls";
import type { LiteListe } from "@/types/lists";

type Props = {
  mode: "create" | "edit";
  disabled?: boolean;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  slugSuffix?: React.ReactNode;
  slugDescription?: string;
  existingSlug?: string;
};

export function PlaceFormFields({
  mode,
  disabled,
  merchantId,
  merchantsLite = [],
  slugSuffix,
  slugDescription,
  existingSlug,
}: Props) {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      {!merchantId ? (
        <RHFCombobox<LiteListe>
          name="merchantId"
          label="Merchant"
          options={merchantsLite}
          getOptionValue={(m) => m.value}
          getOptionLabel={(m) => m.label}
          placeholder="Select merchant"
          searchPlaceholder="Search merchants…"
          requiredStar
          disabled={disabled}
        />
      ) : (
        <input type="hidden" {...register("merchantId")} value={merchantId} />
      )}

      <RHFInput
        name="localName"
        label="Local Name"
        placeholder="Bella Pizza - Downtown"
        requiredStar
        disabled={disabled}
      />

      {mode === "create" ? (
        <RHFInput
          name="slug"
          label="Slug"
          placeholder="bella-pizza-downtown"
          description={slugDescription}
          requiredStar
          disabled={disabled}
          suffix={slugSuffix}
        />
      ) : existingSlug ? (
        <RHFInput
          name="slug"
          label="Slug"
          placeholder={existingSlug}
          description="Slug cannot be changed after creation."
          disabled
        />
      ) : null}

      <RHFInput
        name="address"
        label="Address"
        placeholder="123 Main St, City"
        disabled={disabled}
      />

      <RHFInput
        name="googlePlaceId"
        label="Google Place ID"
        placeholder="Google Place ID"
        disabled={disabled}
      />
    </div>
  );
}
