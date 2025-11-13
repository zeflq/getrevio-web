"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { LandingFormValues } from "../../model/landingSchema";
import { LandingBlockInspectorProps } from "../plugin";

const fieldName = (index: number, key: string) => `content.blocks.${index}.data.${key}`;

export function LegalTextInspector({ index, disabled }: LandingBlockInspectorProps) {
  const { register } = useFormContext<LandingFormValues>();
  const t = useTranslations("landings.editor.blocks.legalText");
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{t("text")}</label>
      <textarea
        {...register(fieldName(index, "text"))}
        className="w-full rounded-md border border-border bg-background p-3 text-sm shadow-sm focus-visible:border-primary focus-visible:outline-none"
        rows={6}
        placeholder={t("placeholder")}
        disabled={disabled}
      />
    </div>
  );
}
