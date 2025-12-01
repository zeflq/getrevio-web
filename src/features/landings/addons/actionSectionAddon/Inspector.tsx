"use client";

import { useTranslations } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFInput, RHFTextArea } from "@/components/form/controls";

export function ActionSectionAddonInspector({
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const t = useTranslations("landings.editor.addons.actionSectionAddon");

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.title`}
        label={t("title")}
        requiredStar
        disabled={disabled}
      />
      <RHFInput
        name={`${fieldName}.subtitle`}
        label={t("subtitle")}
        disabled={disabled}
      />
      <RHFTextArea
        name={`${fieldName}.description`}
        label={t("description")}
        rows={3}
        disabled={disabled}
      />
      <RHFInput
        name={`${fieldName}.buttonLabel`}
        label={t("buttonLabel")}
        requiredStar
        disabled={disabled}
      />
    </div>
  );
}
