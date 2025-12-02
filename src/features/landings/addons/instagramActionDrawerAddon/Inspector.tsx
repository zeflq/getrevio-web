"use client";

import { useTranslations } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFInput } from "@/components/form/controls";

export function InstagramActionDrawerAddonInspector({
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const t = useTranslations("landings.editor.addons.actionsdrawerAddon.instagram");

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.instagramUrl`}
        label={t("instagramUrl")}
        placeholder={t("instagramUrlPlaceholder")}
        requiredStar
        disabled={disabled}
      />
      <RHFInput
        name={`${fieldName}.handle`}
        label={t("handle")}
        placeholder={t("handlePlaceholder")}
        disabled={disabled}
      />
    </div>
  );
}
