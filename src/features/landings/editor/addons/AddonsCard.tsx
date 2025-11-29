"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import type { LandingFormValues } from "../../model/landingSchema";
import type { LandingAddon } from "../../addons";
import { landingAddonPluginMap } from "../../addons";

import { EditorCard } from "../ui/EditorCard";

interface AddonsCardProps {
  id: string;
  addon: LandingAddon;
  index: number;
  total: number;

  selected?: boolean;
  onSelect: () => void;

  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;

  disabled?: boolean;
  disableDuplicate?: boolean;
  disableDelete?: boolean;

  blockIndex: number;
}

export function AddonsCard({
  id,
  addon,
  index,
  total,
  selected = false,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  disabled,
  disableDuplicate,
  disableDelete,
  blockIndex,
}: AddonsCardProps) {
  const t = useTranslations("landings.editor.addons");
  const addonsTranslations = useTranslations("landings.editor.addons.items");

  const plugin = landingAddonPluginMap[addon.kind];
  const InspectorComponent = plugin?.Inspector;

  const typeLabel =
    addonsTranslations(`${addon.kind}.label` as const) ?? addon.kind;

  const description =
    addonsTranslations(`${addon.kind}.description` as const);

  const isFixedAddon = addon.__templateFixed ?? false;

  const { formState } = useFormContext<LandingFormValues>();
  const addonErrors =
    (formState.errors.content?.blocks?.[blockIndex] as any)?.addons?.[index];
  const hasAddonErrors = Boolean(addonErrors);

  // Full data path for this addon's data object
  const fieldName = `content.blocks.${blockIndex}.addons.${index}.data`;

  return (
    <EditorCard
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      isFixed={isFixedAddon}
      hasErrors={hasAddonErrors}
      canMoveUp={index > 0 && !isFixedAddon}
      canMoveDown={index < total - 1  && !isFixedAddon}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canDuplicate={!disableDuplicate}
      canDelete={!disableDelete}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      header={
        <>
          {total > 1 && (
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {t("addonNumber", { index: index + 1 })}
            </div>
          )}
          <div>
            <div className="font-semibold text-sm sm:text-base">{typeLabel}</div>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 sm:line-clamp-none">
                {description}
              </p>
            )}
          </div>
        </>
      }
      content={
        InspectorComponent && (
          <InspectorComponent
            blockIndex={blockIndex}
            addonIndex={index}
            fieldName={fieldName}
            disabled={disabled}
          />
        )
      }
    />
  );
}
