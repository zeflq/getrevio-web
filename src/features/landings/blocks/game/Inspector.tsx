"use client";
import { useTranslations } from "next-intl";

import { RHFInput } from "@/components/form/controls";
import { LandingBlockInspectorProps } from "../plugin";

const fieldName = (index: number, key: string) => `content.blocks.${index}.data.${key}`;

export function GameInspector({ index, disabled, belongsTo, landing }: LandingBlockInspectorProps) {
  const t = useTranslations("landings.editor.blocks.game");
  const campaignDescription =
    belongsTo?.type === "campaign" && landing?.name ? `${t("linkedCampaign")}: ${landing.name}` : undefined;
  return (
    <div className="space-y-4">
      <RHFInput name={fieldName(index, "ctaLabel")} label={t("ctaLabel")} disabled={disabled} />
      <RHFInput
        name={fieldName(index, "linkedCampaignId")}
        label={t("linkedCampaign")}
        disabled={disabled || belongsTo?.type !== "campaign"}
        description={campaignDescription}
      />
      <RHFInput
        name={fieldName(index, "linkedPlaceId")}
        label={t("linkedPlace")}
        disabled={disabled || belongsTo?.type !== "place"}
      />
    </div>
  );
}
