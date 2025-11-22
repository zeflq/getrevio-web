"use client";

import { useTranslations } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFTextArea } from "@/components/form/controls/RHFTextArea";
import { RHFSelect } from "@/components/form/controls";

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
      <RHFSelect
        name={`${fieldName}.align`}
        label={t("align")}
        disabled={disabled}
        options={[
          { label: t("alignOptions.left"), value: "left" },
          { label: t("alignOptions.center"), value: "center" },
          { label: t("alignOptions.right"), value: "right" },
        ]}
      />
      <RHFSelect
        name={`${fieldName}.tone`}
        label={t("tone")}
        disabled={disabled}
        options={[
          { label: t("toneOptions.muted"), value: "muted" },
          { label: t("toneOptions.normal"), value: "normal" },
        ]}
      />
    </div>
  );
}
