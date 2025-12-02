"use client";

import { useTranslations } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFInput } from "@/components/form/controls";

export function GoogleReviewActionDrawerAddonInspector({
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const t = useTranslations("landings.editor.addons.actionsdrawerAddon.google");

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.googleUrl`}
        label={t("googleUrl")}
        placeholder={t("googleUrlPlaceholder")}
        requiredStar
        disabled={disabled}
      />
      <RHFInput
        name={`${fieldName}.placeLabel`}
        label={t("placeLabel")}
        placeholder={t("placeLabelPlaceholder")}
        disabled={disabled}
      />
    </div>
  );
}
