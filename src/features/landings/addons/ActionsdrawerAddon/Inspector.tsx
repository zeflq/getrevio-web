// actionsdrawerAddon/Inspector.tsx
"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { LandingFormValues } from "../../model/landingSchema";
import type { LandingAddonInspectorProps } from "../plugin";
import { RHFSelect } from "@/components/form/controls";
import { GoogleReviewActionDrawerAddonInspector } from "../googleReviewActionDrawerAddon/Inspector";
import { InstagramActionDrawerAddonInspector } from "../instagramActionDrawerAddon/Inspector";
import type { DrawerAddonData, DrawerProvider } from "./schema";

export function ActionDrawerAddonInspector({
  blockIndex,
  addonIndex,
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const t = useTranslations("landings.editor.addons.actionsdrawerAddon");
  const { control } = useFormContext<LandingFormValues>();

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
        label={t("drawerKindLabel")}
        placeholder={t("drawerKindPlaceholder")}
        disabled={disabled}
        options={[
          {
            value: "googleReviewActionDrawerAddon",
            label: t("drawerKindOptions.googleReview"),
          },
          {
            value: "instagramActionDrawerAddon",
            label: t("drawerKindOptions.instagram"),
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
          {t("noKindSelected")}
        </p>
      )}
    </div>
  );
}
