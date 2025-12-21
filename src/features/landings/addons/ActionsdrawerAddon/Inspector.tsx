// actionsdrawerAddon/Inspector.tsx
"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useLocale } from "next-intl";

import type { LandingFormValues } from "../../model/landingSchema";
import type { LandingAddonInspectorProps } from "../plugin";
import { RHFSelect } from "@/components/form/controls";
import { GoogleReviewActionDrawerAddonInspector } from "../googleReviewActionDrawerAddon/Inspector";
import { InstagramActionDrawerAddonInspector } from "../instagramActionDrawerAddon/Inspector";
import type { DrawerAddonData, DrawerProvider } from "./schema";
import { getAddonI18n } from "../../utils/translations/getAddonI18n";
import {
  resolveFieldLabel,
  resolveFieldPlaceholder,
} from "../../utils/translations";

export function ActionDrawerAddonInspector({
  blockIndex,
  addonIndex,
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const locale = useLocale() as "en" | "fr" | "ar";
  const { control } = useFormContext<LandingFormValues>();

  // Get i18n for actionsdrawerAddon
  const i18n = getAddonI18n("actionsdrawerAddon");

  // Resolve field labels
  const providerLabel = resolveFieldLabel("actionsdrawerAddon", "provider", locale);
  const providerPlaceholder = resolveFieldPlaceholder("actionsdrawerAddon", "provider", locale);

  // On regarde le provider actuel: "googleReviewActionDrawerAddon" | "instagramActionDrawerAddon"
  const provider = useWatch({
    control,
    name: `${fieldName}.provider` as any,
  }) as DrawerProvider | undefined;

  return (
    <div className="space-y-4">
      {/* Sélecteur de type de drawer */}
      <RHFSelect
        name={`${fieldName}.provider`}
        label={providerLabel}
        placeholder={providerPlaceholder}
        disabled={disabled}
        options={[
          {
            value: "googleReviewActionDrawerAddon",
            label: i18n?.inspector.options?.provider?.googleReview?.[locale] || "Google Review",
          },
          {
            value: "instagramActionDrawerAddon",
            label: i18n?.inspector.options?.provider?.instagram?.[locale] || "Instagram",
          },
        ]}
      />

      {/* Config spécifique Google Review */}
      {provider === "googleReviewActionDrawerAddon" && (
        <GoogleReviewActionDrawerAddonInspector
          blockIndex={blockIndex}
          addonIndex={addonIndex}
          fieldName={`${fieldName}.config`}
          disabled={disabled}
        />
      )}

      {/* Config spécifique Instagram */}
      {provider === "instagramActionDrawerAddon" && (
        <InstagramActionDrawerAddonInspector
          blockIndex={blockIndex}
          addonIndex={addonIndex}
          fieldName={`${fieldName}.config`}
          disabled={disabled}
        />
      )}

      {!provider && (
        <p className="text-xs text-muted-foreground">
          {i18n?.inspector.messages?.noKindSelected?.[locale] || "No action type selected."}
        </p>
      )}
    </div>
  );
}
