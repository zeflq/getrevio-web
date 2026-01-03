"use client";

import * as React from "react";
import { useFormContext, type FieldErrors } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RHFInput, RHFCombobox, RHFSelect } from "@/components/form/controls";
import type { LiteListe } from "@/types/lists";
import type { ShortlinkFormValues } from "../model/shortlinkSchema";
import { useLandingsLite } from "@/features/landings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { RHFDateInput } from "@/components/form/controls/RHFDateInput";

const CHANNEL_OPTIONS = [
  { value: "__none__", label: "Not specified" },
  { value: "qr", label: "QR" },
  { value: "nfc", label: "NFC" },
  { value: "email", label: "Email" },
  { value: "web", label: "Web" },
  { value: "print", label: "Print" },
  { value: "custom", label: "Custom" },
];

const INFO_FIELD_PREFIXES = [
  "merchantId",
  "code",
  "landingId",
  "active",
  "channel",
  "expiresAt",
] as const;

// --- helpers ---------------------------------------------------

function flattenErrorKeys(errors: FieldErrors<any>, prefix = ""): string[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    if (!value) return [];

    const path = prefix ? `${prefix}.${key}` : key;

    // Leaf error: has message/type
    if ("type" in (value as any) || "message" in (value as any)) {
      return [path];
    }

    // Nested object (e.g. utm.*, root.*, etc.)
    return flattenErrorKeys(value as FieldErrors<any>, path);
  });
}

function hasPrefixKey(keys: string[], prefixes: readonly string[]): boolean {
  return keys.some((key) =>
    prefixes.some((prefix) => key === prefix || key.startsWith(`${prefix}.`)),
  );
}

// --- component --------------------------------------------------

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
    selectedMerchantId ? { merchantId: selectedMerchantId } : {},
  );

  // ✅ no memo: RHF mutates errors object in place
  const errorKeys = flattenErrorKeys(errors);

  const hasUtmError = errorKeys.some(
    (key) => key === "utm" || key.startsWith("utm."),
  );

  const hasInfoError = hasPrefixKey(errorKeys, INFO_FIELD_PREFIXES);

  const minExpiresAt = React.useMemo(() => {
    const nextDay = new Date();
    nextDay.setHours(0, 0, 0, 0);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }, []);

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
                  <FormDescription>
                    Code is generated automatically and cannot be changed.
                  </FormDescription>
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
                  <FormDescription>
                    Inactive shortlinks remain in DB but stop redirecting.
                  </FormDescription>
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
            <RHFSelect
              name="channel"
              label="Channel"
              options={CHANNEL_OPTIONS}
              placeholder="Not specified"
              disabled={disabled}
              parseValue={(value) => (value === "__none__" ? undefined : value)}
            />

            <RHFDateInput
              name="expiresAt"
              label="Expires At"
              disabled={disabled}
              min={minExpiresAt}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="utm">
        <div className="space-y-3 rounded-md border border-dashed border-muted p-3">
          <div>
            <h3 className="text-sm font-medium">UTM Parameters</h3>
            <p className="text-xs text-muted-foreground">
              Optional tracking values appended to the redirect URL.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <RHFInput
              name="utm.source"
              label="UTM Source"
              placeholder="instagram"
              disabled={disabled}
            />
            <RHFInput
              name="utm.medium"
              label="UTM Medium"
              placeholder="social"
              disabled={disabled}
            />
            <RHFInput
              name="utm.campaign"
              label="UTM Campaign"
              placeholder="summer_blast"
              disabled={disabled}
            />
            <RHFInput
              name="utm.term"
              label="UTM Term"
              placeholder="keyword"
              disabled={disabled}
            />
            <RHFInput
              name="utm.content"
              label="UTM Content"
              placeholder="cta-1"
              disabled={disabled}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}