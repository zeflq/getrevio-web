"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { LandingFormValues } from "../../model/landingSchema";

interface SimpleHeroInspectorProps {
  index: number;
  disabled?: boolean;
  onConvert?: () => void;
}

export function SimpleHeroInspector({ index, disabled, onConvert }: SimpleHeroInspectorProps) {
  const form = useFormContext<LandingFormValues>();
  const t = useTranslations("landings.editor.blocks.simpleHero");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`content.blocks.${index}.title` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("title")}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t("title")} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`content.blocks.${index}.subtitle` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("subtitle")}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t("subtitle")} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="button" variant="outline" disabled={disabled} onClick={onConvert}>
        {t("convert")}
      </Button>
    </div>
  );
}
