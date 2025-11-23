"use client";

import * as React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { LandingFormValues } from "../../model/landingSchema";
import type { TemplateBlockDefinition } from "@/features/landings/templates/types";
import {
  createAddonByKind,
  landingAddonPluginMap,
  type LandingAddon,
} from "@/features/landings/addons";
import { AddonsActions } from "./AddonsActions";
import { Button } from "@/components/ui/button";

interface BlockAddonsSectionProps {
  index: number;
  disabled?: boolean;
  templateBlock?: TemplateBlockDefinition | null;
}

type AddonsArrayPath = `content.blocks.${number}.addons`;
const addonsArrayPath = (blockIndex: number): AddonsArrayPath => `content.blocks.${blockIndex}.addons`;

const fieldPrefix = (blockIndex: number, addonIndex: number) =>
  `content.blocks.${blockIndex}.addons.${addonIndex}.data`;

export function BlockAddonsSection({ index, disabled, templateBlock }: BlockAddonsSectionProps) {
  const t = useTranslations("landings.editor.addons");
  const { control } = useFormContext<LandingFormValues>();

  const { fields, append, remove } = useFieldArray({
    name: addonsArrayPath(index),
    control,
  });

  const addonFields = fields as Array<LandingAddon & { id: string }>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("sectionLabel")}</p>
        {templateBlock?.addons && templateBlock.addons.length > 0 && (
          <AddonsActions
            disabled={disabled}
            buttonLabel={t("add")}
            slots={templateBlock.addons}
            activeAddons={addonFields}
            onSelect={(slot) => append(createAddonByKind(slot.kind, slot.defaultData))}
          />
        )}
      </div>

      {addonFields.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("empty")}</p>
      ) : (
        addonFields.map((addon, addonIndex) => {
          const InspectorComponent = landingAddonPluginMap[addon.kind]?.Inspector;
          const baseFieldName = fieldPrefix(index, addonIndex);
          const addonLabel = landingAddonPluginMap[addon.kind]?.label ?? addon.kind;

          return (
            <div
              key={addon.id ?? `${addon.kind}-${addonIndex}`}
              className={cn("rounded-lg border border-border/40 bg-background/60 p-3 space-y-3")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{addonLabel}</p>
                </div>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => remove(addonIndex)}
                  disabled={disabled}
                >
                  {t("remove")}
                </Button>
              </div>
              {InspectorComponent && (
                <InspectorComponent
                  blockIndex={index}
                  addonIndex={addonIndex}
                  disabled={disabled}
                  fieldName={baseFieldName}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
