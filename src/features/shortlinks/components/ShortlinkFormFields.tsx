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
import { useLandingsLite } from "@/features/landings";
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

  const selectedMerchantId = merchantId ?? watch("merchantId");

  const { data: landingsLite = [], isLoading: landingsLoading } = useLandingsLite(
    selectedMerchantId ? { merchantId: selectedMerchantId } : {}
  );

  const flatKeys = useFlattenErrors(errors);
  const hasInfoError = flatKeys.some((key) => !key.startsWith("utm"));
  const hasUtmError = flatKeys.some((key) => key.startsWith("utm"));

  return (
    <Tabs defaultValue="info" className="space-y-4">
      <TabsList className="flex w-full">
        <TabsTrigger
          value="info"
          className={cn("flex-1", hasInfoError && "text-destructive font-medium")}
        >
          Info
        </TabsTrigger>
        <TabsTrigger
          value="utm"
          className={cn("flex-1", hasUtmError && "text-destructive font-medium")}
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

          <RHFCombobox<LiteListe>
            name="landingId"
            label="Landing"
            options={landingsLite}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            placeholder={selectedMerchantId ? "Select landing" : "Select merchant first"}
            searchPlaceholder="Search landings…"
            requiredStar
            disabled={disabled || !selectedMerchantId || landingsLoading}
            loading={landingsLoading}
            keyBy={`landing-${selectedMerchantId}`}
          />

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

          <div className="grid gap-4 md:grid-cols-2">
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
