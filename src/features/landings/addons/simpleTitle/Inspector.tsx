"use client";

import { useTranslations } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFInput, RHFTextArea } from "@/components/form/controls";

export function SimpleTitleAddonInspector({ fieldName, disabled }: LandingAddonInspectorProps) {
  const t = useTranslations("landings.editor.addons.simpleTitle");

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.title`}
        label={t("title")}
        requiredStar
        disabled={disabled}
      />
      <RHFTextArea
        name={`${fieldName}.subtitle`}
        label={t("subtitle")}
        rows={3}
        disabled={disabled}
      />
    </div>
  );
}
