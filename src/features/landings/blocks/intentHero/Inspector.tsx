"use client";
import { useTranslations } from "next-intl";

import { RHFInput } from "@/components/form/controls";
import { LandingBlockInspectorProps } from "../plugin";

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
      <RHFInput
        name={fieldName(index, "cta.label")}
        label={t("ctaLabel")}
        requiredStar
        disabled={disabled}
      />
    </div>
  );
}
