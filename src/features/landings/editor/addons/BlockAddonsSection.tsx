"use client";

import * as React from "react";
import { useFormContext, useWatch, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { LandingFormValues } from "../../model/landingSchema";
import type { TemplateBlockDefinition } from "../../templates/types";
import { EmptyState } from "../ui/EmptyState";

import { AddonsActions } from "./AddonsActions";
import {
  createAddonByKind,
  type LandingAddon,
  type LandingAddonKind,
  type LandingBlockAddonDefinition,
} from "../../addons";
import { AddonsCard } from "./AddonsCard";

type BlockAddonsSectionProps = {
  blockIndex: number;
  disabled?: boolean;
  templateBlock?: TemplateBlockDefinition | null;
};

export function BlockAddonsSection({
  blockIndex,
  disabled,
  templateBlock,
}: BlockAddonsSectionProps) {
  const t = useTranslations("landings.editor.addons");
  const form = useFormContext<LandingFormValues>();

  const addons = (useWatch({
    control: form.control,
    name: `content.blocks.${blockIndex}.addons` as const,
  }) ?? []) as LandingAddon[];

  const {
    fields: addonFields,
    append,
    insert,
    move,
    remove,
  } = useFieldArray({
    control: form.control,
    name: `content.blocks.${blockIndex}.addons` as const,
  });

  const [selectedAddonId, setSelectedAddonId] = React.useState<string | null>(
    null
  );

  const addonSlots = React.useMemo(
    () => (templateBlock?.addons ?? []) as LandingBlockAddonDefinition[],
    [templateBlock]
  );

  /** counts per addon kind */
  const counts = React.useMemo(() => {
    return addons.reduce<Record<string, number>>((acc, a) => {
      acc[a.kind] = (acc[a.kind] ?? 0) + 1;
      return acc;
    }, {});
  }, [addons]);

  /**
   * max instances per kind (like getTemplateMaxInstanceMap but for addons)
   * If multiple slots same kind => keep the largest maxInstances.
   */
  const addonMaxByKind = React.useMemo(() => {
    const map = new Map<LandingAddonKind, number>();
    addonSlots.forEach((slot) => {
      if (slot.maxInstances == null) return;
      const current = map.get(slot.kind);
      map.set(slot.kind, current == null ? slot.maxInstances : Math.max(current, slot.maxInstances));
    });
    return map;
  }, [addonSlots]);

  /**
   * required fixed count per kind (like getTemplateFixedCountMap but for addons)
   */
  const addonRequiredFixedByKind = React.useMemo(() => {
    const map = new Map<LandingAddonKind, number>();
    addonSlots
      .filter((slot) => slot.mode === "fixed")
      .forEach((slot) => {
        map.set(slot.kind, (map.get(slot.kind) ?? 0) + 1);
      });
    return map;
  }, [addonSlots]);

  const addOptionDisabled = (slot: LandingBlockAddonDefinition) => {
    const current = counts[slot.kind] ?? 0;
    const reached =
      slot.maxInstances != null && current >= slot.maxInstances;
    return reached || (disabled ?? false);
  };

  const handleAddFromSlot = (slot: LandingBlockAddonDefinition) => {
    const current = counts[slot.kind] ?? 0;
    const max = slot.maxInstances;
    if (max != null && current >= max) return;

    const addon = createAddonByKind(slot.kind, slot.defaultData);

    if (slot.id) addon.__templateAddonId = slot.id;
    if (slot.mode === "fixed") addon.__templateFixed = true;

    append(addon);
  };

  const handleDuplicateAddon = (index: number) => {
    const source = addons[index];
    if (!source) return;

    const max = addonMaxByKind.get(source.kind);
    const current = counts[source.kind] ?? 0;
    if (max != null && current >= max) return;

    insert(index + 1, {
      ...source,
      id: undefined,
      __templateFixed: false, // duplicated addon is optional
      __templateAddonId: undefined,
    } as any);
  };

  const handleDeleteAddon = (index: number) => {
    const addon = addons[index];
    if (!addon) return;

    // Same guard as blocks: don't delete below required fixed count
    if (addon.__templateFixed) {
      const required = addonRequiredFixedByKind.get(addon.kind);
      if (required != null) {
        const currentFixedCount = addons.filter(
          (a) => a.kind === addon.kind && a.__templateFixed
        ).length;

        if (currentFixedCount <= required) {
          return; // block deletion
        }
      }
    }

    remove(index);
  };

  // if (!addonFields.length) {
  //   return (
  //     <div className="space-y-4 rounded-lg border border-dashed p-4">
  //       <div className="flex items-center justify-between">
  //         <p className="text-sm font-semibold text-foreground">
  //           {t("sectionLabel")}
  //         </p>
  //         {addonSlots.length > 0 && (
  //           <AddonsActions
  //             disabled={disabled}
  //             buttonLabel={t("add")}
  //             slots={addonSlots}
  //             activeAddons={addons}
  //             addOptionDisabled={addOptionDisabled}
  //             onSelect={handleAddFromSlot}
  //           />
  //         )}
  //       </div>
  //       <EmptyState />
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-3">
      <AddonsActions
        label={t("sectionLabel")}
        addLabel={t("add")}
        empty={addonFields.length === 0}
        disabled={disabled}
        slots={addonSlots}
        activeAddons={addons}
        addOptionDisabled={addOptionDisabled}
        onSelect={handleAddFromSlot}
      />

      <div className="space-y-2">
        {addonFields.map((field, index) => {
          const addon = addons[index];
          if (!addon) return null;

          const max = addonMaxByKind.get(addon.kind);
          const requiredFixed = addonRequiredFixedByKind.get(addon.kind);
          const currentCount = counts[addon.kind] ?? 0;

          return (
            <AddonsCard
              key={field.id}
              id={field.id}
              addon={addon}
              index={index}
              total={addonFields.length}
              blockIndex={blockIndex}
              selected={field.id === selectedAddonId}
              onSelect={() =>
                setSelectedAddonId((prev) =>
                  prev === field.id ? null : field.id
                )
              }
              onMoveUp={() => move(index, Math.max(0, index - 1))}
              onMoveDown={() =>
                move(index, Math.min(addonFields.length - 1, index + 1))
              }
              onDuplicate={() => handleDuplicateAddon(index)}
              onDelete={() => handleDeleteAddon(index)}
              disabled={disabled}
              disableDuplicate={
                max != null && currentCount >= max
              }
              disableDelete={
                requiredFixed != null && currentCount <= requiredFixed
              }
            />
          );
        })}
      </div>
    </div>
  );
}
