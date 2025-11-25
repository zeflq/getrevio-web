"use client";

import { useTranslations } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFTextArea } from "@/components/form/controls/RHFTextArea";

export function FooterAddonInspector({ fieldName, disabled }: LandingAddonInspectorProps) {
  const t = useTranslations("landings.editor.addons.footerAddon");

  return (
    <div className="space-y-4">
      <RHFTextArea
        name={`${fieldName}.text`}
        label={t("text")}
        placeholder={t("placeholder")}
        requiredStar
        disabled={disabled}
      />
    </div>
  );
}
