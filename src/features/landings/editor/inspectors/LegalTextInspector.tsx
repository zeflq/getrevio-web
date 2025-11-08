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
import type { LandingFormValues } from "../../model/landingSchema";

interface LegalTextInspectorProps {
  index: number;
  disabled?: boolean;
}

export function LegalTextInspector({ index, disabled }: LegalTextInspectorProps) {
  const form = useFormContext<LandingFormValues>();
  const t = useTranslations("landings.editor.blocks.legalText");

  return (
    <FormField
      control={form.control}
      name={`content.blocks.${index}.text` as const}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("text")}</FormLabel>
          <FormControl>
            <textarea
              {...field}
              className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t("placeholder")}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
