"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { LandingFormValues } from "../../model/landingSchema";
import type { LandingAddonInspectorProps } from "../plugin";
import { RHFSelect } from "@/components/form/controls";
import { GoogleReviewActionDrawerAddonInspector } from "../googleReviewActionDrawerAddon/Inspector";
import { InstagramActionDrawerAddonInspector } from "../instagramActionDrawerAddon/Inspector";
import { DrawerAddonData } from "./schema";

type DrawerKind = DrawerAddonData["drawer"]["kind"];


export function ActionDrawerAddonInspector({
  blockIndex,
  addonIndex,
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const t = useTranslations("landings.editor.addons.actionsdrawerAddon");
  const { control } = useFormContext<LandingFormValues>();

  const drawerKind = useWatch({
    control,
    name: `${fieldName}.drawer.kind` as any,
  }) as DrawerKind;

  return (
    <div className="space-y-4">
      {/* Sélecteur de type de drawer */}
      <RHFSelect
        name={`${fieldName}.drawer.kind`}
        label={t("drawerKindLabel")}
        placeholder={t("drawerKindPlaceholder")}
        disabled={disabled}
        options={[
          { value: "googleReviewActionDrawerAddon", label: t("drawerKindOptions.googleReview") },
          { value: "instagramActionDrawerAddon", label: t("drawerKindOptions.instagram") },
        ]}
      />

      {/* Config spécifique Google Review */}
      {drawerKind === "googleReviewActionDrawerAddon" && (
        <GoogleReviewActionDrawerAddonInspector
          blockIndex={blockIndex}
          addonIndex={addonIndex}
          fieldName={`${fieldName}.drawer`}
          disabled={disabled}
        />
      )}

      {/* Config spécifique Instagram (à implémenter si tu veux la variante) */}
      {drawerKind === "instagramActionDrawerAddon" && (
        <InstagramActionDrawerAddonInspector
          blockIndex={blockIndex}
          addonIndex={addonIndex}
          fieldName={`${fieldName}.drawer`}
          disabled={disabled}
        />
      )}

      {!drawerKind && (
        <p className="text-xs text-muted-foreground">
          {t("noKindSelected")}
        </p>
      )}
    </div>
  );
}
