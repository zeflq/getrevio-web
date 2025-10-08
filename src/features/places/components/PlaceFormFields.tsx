// src/features/places/components/PlaceFormFields.tsx
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { RHFInput, RHFCombobox } from "@/components/form/controls";
import { useFlattenErrors } from "@/components/form/useFlattenErrors";
import type { MerchantLite } from "@/features/merchants";
import { LandingDefaultsFields } from "@/features/landing";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Props = {
  mode: "create" | "edit";
  disabled?: boolean;
  merchantId?: string;
  merchantsLite?: MerchantLite[];
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
  const { register, formState: { errors } } = useFormContext();

  const flatKeys = useFlattenErrors(errors);

  const hasLandingError = flatKeys.some(k => k.startsWith("landingDefaults"));
  const hasInfoError = flatKeys.some(k => !k.startsWith("landingDefaults"));

  return (
    <Tabs defaultValue="info" className="space-y-4">
      <TabsList>
        <TabsTrigger
          value="info"
          className={cn(hasInfoError && "text-destructive font-medium")}
        >
          Info
        </TabsTrigger>
        <TabsTrigger
          value="landing"
          className={cn(hasLandingError && "text-destructive font-medium")}
        >
          Landing Page
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <div className="space-y-4">
          {!merchantId ? (
            <RHFCombobox<MerchantLite>
              name="merchantId"
              label="Merchant"
              options={merchantsLite}
              getOptionValue={(m) => String(m.id)}
              getOptionLabel={(m) => m.name}
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
      </TabsContent>

      <TabsContent value="landing">
        <LandingDefaultsFields
          name="landingDefaults"
          contextHint="place"
          disabled={disabled}
        />
      </TabsContent>
    </Tabs>
  );
}
