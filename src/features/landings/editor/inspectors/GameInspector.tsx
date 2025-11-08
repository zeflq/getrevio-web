"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { LandingBelongsTo, LandingFormValues } from "../../model/landingSchema";

interface GameInspectorProps {
  index: number;
  disabled?: boolean;
  contextLabel?: string;
  belongsTo?: LandingBelongsTo;
}

export function GameInspector({ index, disabled, contextLabel, belongsTo }: GameInspectorProps) {
  const form = useFormContext<LandingFormValues>();
  const t = useTranslations("landings.editor.blocks.game");
  const contextDescription = belongsTo?.type === "campaign" ? t("linkedCampaign") : t("linkedPlace");

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{contextDescription}</p>
        <p>{contextLabel ?? contextDescription}</p>
      </div>

      <FormField
        control={form.control}
        name={`content.blocks.${index}.ctaLabel` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("ctaLabel")}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t("ctaLabel")} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
