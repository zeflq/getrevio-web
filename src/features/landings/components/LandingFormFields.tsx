// src/features/landings/components/LandingFormFields.tsx
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import { RHFInput, RHFSelect, RHFCombobox } from "@/components/form/controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useFlattenErrors } from "@/components/form/useFlattenErrors";
import type { LiteListe } from "@/types/lists";

import type { LandingFormValues } from "../model/landingSchema";

type Props = {
  mode: "create" | "edit";
  disabled?: boolean;
  merchantId?: string;
  merchantsLite?: LiteListe[];
};

export function LandingFormFields({
  mode: _mode,
  disabled,
  merchantId,
  merchantsLite = [],
}: Props) {
  const { register, formState: { errors } } = useFormContext<LandingFormValues>();
  const flatErrors = useFlattenErrors(errors);

  const hasSettingsError = flatErrors.some((k) => k.startsWith("settings"));
  const hasContentError = flatErrors.some((k) => k.startsWith("content"));

  return (
    <Tabs defaultValue="settings" className="space-y-4">
      <TabsList className="flex w-full">
        <TabsTrigger
          value="settings"
          className={cn("flex-1", hasSettingsError && "text-destructive font-medium")}
        >
          Settings
        </TabsTrigger>
        <TabsTrigger
          value="content"
          className={cn("flex-1", hasContentError && "text-destructive font-medium")}
        >
          Content
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings" className="space-y-4">
        {!merchantId ? (
          <RHFCombobox<LiteListe>
            name="settings.merchantId"
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
          <input type="hidden" {...register("settings.merchantId")} value={merchantId} />
        )}

        <RHFInput
          name="settings.name"
          label="Name"
          placeholder="Landing name"
          requiredStar
          disabled={disabled}
        />

        <RHFSelect
          name="settings.status"
          label="Status"
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ]}
          placeholder="Select status"
          disabled={disabled}
        />
      </TabsContent>

      <TabsContent value="content" className="space-y-4">
        <RHFSelect
          name="content.layout"
          label="Layout"
          options={[
            { value: "full", label: "Full" },
            { value: "boxed", label: "Boxed" },
          ]}
          placeholder="Select layout"
          disabled={disabled}
        />

        <div className="rounded-lg border p-4 space-y-4">
          <div>
            <p className="text-sm font-medium">Hero Block</p>
            <p className="text-xs text-muted-foreground">
              Primary section displayed on the landing page.
            </p>
          </div>

          <RHFInput
            name="content.blocks.0.title"
            label="Title"
            placeholder="Welcome to our landing"
            requiredStar
            disabled={disabled}
          />

          <RHFInput
            name="content.blocks.0.subtitle"
            label="Subtitle"
            placeholder="Short supporting copy"
            disabled={disabled}
          />

          <RHFInput
            name="content.blocks.0.imageUrl"
            label="Hero Image URL"
            placeholder="https://example.com/hero.jpg"
            disabled={disabled}
          />

          <div className="space-y-3">
            <p className="text-sm font-medium">Primary CTA</p>
            <RHFInput
              name="content.blocks.0.ctas.0.label"
              label="Label"
              placeholder="Book now"
              disabled={disabled}
            />
            <RHFInput
              name="content.blocks.0.ctas.0.url"
              label="URL"
              placeholder="https://example.com/book"
              disabled={disabled}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Secondary CTA</p>
            <RHFInput
              name="content.blocks.0.ctas.1.label"
              label="Label"
              placeholder="Learn more"
              disabled={disabled}
            />
            <RHFInput
              name="content.blocks.0.ctas.1.url"
              label="URL"
              placeholder="https://example.com/more"
              disabled={disabled}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
