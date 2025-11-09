// src/features/places/components/PlaceFormFields.tsx
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { RHFInput, RHFCombobox } from "@/components/form/controls";
import type { LiteListe } from "@/types/lists";

type Props = {
  disabled?: boolean;
  merchantId?: string;
  merchantsLite?: LiteListe[];
};

export function PlaceFormFields({
  disabled,
  merchantId,
  merchantsLite = [],
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

      <RHFInput
        name="address"
        label="Address"
        placeholder="123 Main St, City"
        disabled={disabled}
      />
    </div>
  );
}
