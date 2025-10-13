"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RHFInput, RHFCombobox } from "@/components/form/controls";
import { useFlattenErrors } from "@/components/form/useFlattenErrors";
import type { LiteListe } from "@/types/lists";
import type { ShortlinkFormValues } from "../model/shortlinkSchema";
import { usePlacesLite } from "@/features/places";
import { useCampaignsLite } from "@/features/campaigns";
import { useThemesLite } from "@/features/themes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { RHFDateInput } from "@/components/form/controls/RHFDateInput";

const CHANNEL_OPTIONS = [
  { value: "qr", label: "QR" },
  { value: "nfc", label: "NFC" },
  { value: "email", label: "Email" },
  { value: "web", label: "Web" },
  { value: "print", label: "Print" },
  { value: "custom", label: "Custom" },
];

type Props = {
  mode: "create" | "edit";
  disabled?: boolean;
  merchantId?: string;
  merchantsLite?: LiteListe[];
};

export function ShortlinkFormFields({
  mode,
  disabled,
  merchantId,
  merchantsLite = [],
}: Props) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<ShortlinkFormValues>();

  const target = watch("target");
  const targetType: "campaign" | "place" | "none" = (target?.t ?? "none") as
    | "campaign"
    | "place"
    | "none";
  const selectedMerchantId = merchantId ?? watch("merchantId");

  // fetch places (lite) for combobox (scoped to merchant if available)
  const { data: placesLite = [], isLoading: placesLoading } = usePlacesLite(
    selectedMerchantId ? { merchantId: selectedMerchantId } : {}
  );

  const { data: campaignsLite = [], isLoading: campaignsLoading } = useCampaignsLite(
    selectedMerchantId ? { merchantId: selectedMerchantId } : {}
  );

  const { data: themesLite = [], isLoading: themesLoading } = useThemesLite(
    selectedMerchantId ? { merchantId: selectedMerchantId } : {},
    { enabled: !!selectedMerchantId }
  );

  const flatKeys = useFlattenErrors(errors);
  const hasInfoError = flatKeys.some((key) => !key.startsWith("utm"));
  const hasUtmError = flatKeys.some((key) => key.startsWith("utm"));

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
          value="utm"
          className={cn(hasUtmError && "text-destructive font-medium")}
        >
          UTM Parameters
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info">
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

          {mode === "edit" && (
            <FormField
              control={control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium text-muted-foreground">
                    {field.value ?? "—"}
                  </div>
                  <FormDescription>Code is generated automatically and cannot be changed.</FormDescription>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={control}
            name="target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Target Type <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={disabled}
                    value={target?.t ?? "none"}
                    onChange={(event) => {
                      const next = event.target.value as "none" | "campaign" | "place";
                      const current = field.value;
                      if (next === "none") {
                        field.onChange(null);
                        return;
                      }
                      if (next === "campaign") {
                        field.onChange({
                          t: "campaign",
                          cid: current && current.t === "campaign" ? current.cid : "",
                        });
                        return;
                      }
                      field.onChange({
                        t: "place",
                        pid: current && current.t === "place" ? current.pid : "",
                      });
                    }}
                  >
                    <option value="none">Select target…</option>
                    <option value="campaign">Campaign</option>
                    <option value="place">Place</option>
                  </select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {targetType === "campaign" && (
            <RHFCombobox<LiteListe>
              name="target.cid"
              label="Campaign ID"
              options={campaignsLite}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              placeholder="Select campaign"
              requiredStar
              disabled={disabled || !selectedMerchantId || campaignsLoading}
              key="campaign-target"
            />
          )}

          {targetType === "place" && (
            <RHFCombobox<LiteListe>
              name="target.pid"
              label="Place"
              options={placesLite}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              placeholder="Select place"
              searchPlaceholder="Search places…"
              requiredStar
              disabled={disabled || !selectedMerchantId || placesLoading}
              key="place-target"
            />
          )}

          <FormField
            control={control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border border-dashed border-muted p-3">
                <div className="space-y-1">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>Inactive shortlinks remain in DB but stop redirecting.</FormDescription>
                </div>
                <FormControl>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <FormControl>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={disabled}
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(event.target.value || undefined)
                      }
                    >
                      <option value="">Not specified</option>
                      {CHANNEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <RHFCombobox<LiteListe>
              name="themeId"
              label="Theme Override"
              options={themesLite}
              getOptionValue={(t) => t.value}
              getOptionLabel={(t) => t.label}
              placeholder="Not specified"
              searchPlaceholder="Search themes…"
              disabled={disabled || themesLoading || !selectedMerchantId}
              loading={themesLoading}
              valueIsNullable
            />

            <RHFDateInput
              name="expiresAt"
              label="Expires At"
              disabled={disabled}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="utm">
        <div className="space-y-3 rounded-md border border-dashed border-muted">
          <div>
            <h3 className="text-sm font-medium">UTM Parameters</h3>
            <p className="text-xs text-muted-foreground">
              Optional tracking values appended to the redirect URL.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <RHFInput name="utm.source" label="UTM Source" placeholder="instagram" disabled={disabled} />
            <RHFInput name="utm.medium" label="UTM Medium" placeholder="social" disabled={disabled} />
            <RHFInput name="utm.campaign" label="UTM Campaign" placeholder="summer_blast" disabled={disabled} />
            <RHFInput name="utm.term" label="UTM Term" placeholder="keyword" disabled={disabled} />
            <RHFInput name="utm.content" label="UTM Content" placeholder="cta-1" disabled={disabled} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
