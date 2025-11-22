"use client";

import * as React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { LandingFormValues } from "../model/landingSchema";
import type { TemplateBlockDefinition } from "@/features/landings/templates/types";
import {
  createAddonByKind,
  landingAddonPluginMap,
  type LandingAddon,
  type LandingAddonKind,
} from "@/features/landings/addons";

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
  const optionalSlots = (templateBlock?.addons ?? []).filter((slot) => slot.mode === "optional");

  const addonCounts = React.useMemo(() => {
    const map = new Map<LandingAddonKind, number>();
    addonFields.forEach((addon) => {
      map.set(addon.kind, (map.get(addon.kind) ?? 0) + 1);
    });
    return map;
  }, [addonFields]);

  const canAddAddon = optionalSlots.some((slot) => {
    const currentCount = addonCounts.get(slot.kind) ?? 0;
    return slot.maxInstances === undefined || currentCount < slot.maxInstances;
  });

  return (
    <div className="space-y-4 rounded-lg border border-border/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("sectionLabel")}</p>
        {optionalSlots.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={disabled || !canAddAddon}>
                {t("add")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {optionalSlots.map((slot) => {
                const currentCount = addonCounts.get(slot.kind) ?? 0;
                const reachedLimit = slot.maxInstances !== undefined && currentCount >= slot.maxInstances;
                const label = slot.label ?? landingAddonPluginMap[slot.kind]?.label ?? slot.kind;
                return (
                  <DropdownMenuItem
                    key={`${slot.kind}-${slot.mode}`}
                    onSelect={() => append(createAddonByKind(slot.kind, slot.defaultData))}
                    disabled={disabled || reachedLimit}
                  >
                    {label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
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
