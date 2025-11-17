"use client";
import { useTranslations } from "next-intl";

import { RHFInput } from "@/components/form/controls";
import { LandingBlockInspectorProps } from "../plugin";
import { RHFTextArea } from "@/components/form/controls/RHFTextArea";

const fieldName = (index: number, key: string) => `content.blocks.${index}.data.${key}`;

export function IntentHeroInspector({ index, disabled }: LandingBlockInspectorProps) {
  const t = useTranslations("landings.editor.blocks.intentHero");
  return (
    <div className="space-y-4">
      <RHFInput
        name={fieldName(index, "title")}
        label={t("title")}
        disabled={disabled}
      />
      <RHFInput
        name={fieldName(index, "subtitle")}
        label={t("subtitle")}
        disabled={disabled}
      />
      <RHFTextArea
          name={fieldName(index, "description")}
          label={t("descriptionLabel")}
          disabled={disabled}
          rows={6}
      />
      <RHFInput
        name={fieldName(index, "cta.label")}
        label={t("ctaLabel")}
        requiredStar
        disabled={disabled}
      />
    </div>
  );
}
