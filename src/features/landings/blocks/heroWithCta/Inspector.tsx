"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { RHFInput, RHFSelect } from "@/components/form/controls";
import type { LandingFormValues } from "../../model/landingSchema";
import type { LandingBlockInspectorProps } from "../plugin";

const fieldName = (index: number, key: string) =>
  `content.blocks.${index}.data.${key}`;
const ctasPath = (index: number) => `content.blocks.${index}.data.ctas`;

export function HeroWithCtaInspector({ index, disabled }: LandingBlockInspectorProps) {
  const t = useTranslations("landings.editor.blocks.heroWithCta");
  const { control } = useFormContext<LandingFormValues>();
  
  const { fields, append, remove } = useFieldArray<
    LandingFormValues,
    `content.blocks`
  >({
    name: `content.blocks`,
    control,
  });

  const canAdd = fields.length < 2;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <RHFInput
          name={fieldName(index, "title")}
          label={t("title")}
          requiredStar
          disabled={disabled}
        />
        <RHFInput
          name={fieldName(index, "subtitle")}
          label={t("subtitle")}
          disabled={disabled}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{t("ctas")}</h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ label: "", url: "", style: "primary" })}
            disabled={disabled || !canAdd}
          >
            {t("addCta")}
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="rounded-md border border-muted bg-muted/5 p-4 space-y-4"
            >
              <div className="flex flex-col items-end gap-2 md:flex-row">
                <RHFInput
                  name={`${ctasPath(index)}.${idx}.label`}
                  label={t("ctaLabel")}
                  requiredStar
                  disabled={disabled}
                />
                <RHFInput
                  name={`${ctasPath(index)}.${idx}.url`}
                  label={t("ctaUrl")}
                  placeholder="https://"
                  disabled={disabled}
                />
                <RHFSelect
                  className="w-full md:w-[100px]"
                  name={`${ctasPath(index)}.${idx}.style`}
                  label={t("ctaStyle")}
                  disabled={disabled}
                  options={[
                    { label: t("primary"), value: "primary" },
                    { label: t("secondary"), value: "secondary" },
                  ]}
                />
              </div>
              {fields.length > 1 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(idx)}
                    disabled={disabled}
                  >
                    {t("removeCta")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
