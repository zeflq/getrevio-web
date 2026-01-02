"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useLocale } from "next-intl";

import { createBlockByKind, type LandingBlock, type LandingBlockKind } from "../blocks";
import type { LandingBelongsTo, LandingFormValues } from "../model/landingSchema";
import type { Landing } from "@/types/domain";
import { getTemplateByIdForLocale } from "../templates";
import type { TemplateBlockDefinition } from "../templates/types";
import { getTemplateFixedCountMap } from "../templates/utils";
import { useBlocksFieldArray } from "./hooks/useBlocksFieldArray";
import { useSelectedBlock } from "./hooks/useSelectedBlock";
import { BlockList } from "./block/BlockList";
import { clone, createId } from "../utils/serialization";

interface LandingContentEditorProps {
  landing?: Landing | null;
  disabled?: boolean;
}

export function LandingContentEditor({ landing, disabled }: LandingContentEditorProps) {
  const locale = useLocale();
  const form = useFormContext<LandingFormValues>();

  const blocks =
    (useWatch<LandingFormValues, "content.blocks">({
      name: "content.blocks",
      control: form.control,
    }) ?? []) as LandingBlock[];

  const { fields, append, insert, move, remove } = useBlocksFieldArray();
  const { selectedId, selectById, selectByIndex } = useSelectedBlock(fields);

  // Template is now fully controlled by the system:
  const templateId = landing?.templateId;

  // Get template with actual translations for current locale
  const template = React.useMemo(
    () => getTemplateByIdForLocale(templateId, locale),
    [templateId, locale]
  );

  // Keep form in sync with derived templateId
  // React.useEffect(() => {
  //   form.setValue("templateId", templateId, {
  //     shouldDirty: true,
  //     shouldValidate: false,
  //   });
  // }, [form, templateId]);

  const templateRequiredFixed = React.useMemo(
    () => getTemplateFixedCountMap(template),
    [template]
  );

 // const hasSeededTemplate = React.useRef(false);

  // Seed fixed blocks from template once
  // React.useEffect(() => {
  //   if (hasSeededTemplate.current) return;

  //   const fixedSlots =
  //     template?.blocks?.filter((definition) => definition.mode === "fixed") ?? [];
  //   if (!fixedSlots.length) return;
  //   if (blocks.length > 0) return;

  //   hasSeededTemplate.current = true;

  //   fixedSlots.forEach((definition) => {
  //     const block = createBlockByKind(
  //       definition.kind,
  //       definition.defaultData as any
  //     );
  //     block.__templateBlockId = definition.id;
  //     block.__templateFixed = true;
  //     append(block);
  //   });
  // }, [append, blocks.length, template]);

  const handleAddBlock = (
    kind: LandingBlockKind,
    templateBlock?: TemplateBlockDefinition
  ) => {
    // templateBlock now contains actual translations for current locale
    const block = createBlockByKind(
      kind,
      templateBlock?.defaultData as any,
      templateBlock?.addons,
      templateBlock?.label, // Already translated text
      templateBlock?.description // Already translated text
    );
    if (templateBlock) {
      block.__templateBlockId = templateBlock.id;
      if (templateBlock.mode === "fixed") {
        block.__templateFixed = true;
      }
    }
    append(block);
  };

  const handleDuplicate = (index: number) => {
    const source = blocks[index];
    if (!source) return;

    const duplicate: LandingBlock = {
      id: createId(),
      kind: source.kind,
      data: clone(source.data),
      addons: clone(source.addons).map((addon) => ({
        ...addon,
        id: createId(),
      })),
    };

    insert(index + 1, duplicate);
    selectByIndex(index + 1);
  };

  const handleDelete = (index: number) => {
    const block = blocks[index];
    if (!block) return;

    if (block.__templateFixed) {
      const requiredCount = templateRequiredFixed.get(block.kind);
      if (requiredCount !== undefined) {
        const currentFixedCount = blocks.filter(
          (entry) => entry.kind === block.kind && entry.__templateFixed
        ).length;
        if (currentFixedCount <= requiredCount) {
          return;
        }
      }
    }

    remove(index);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
  };

  const templateDescription = template?.meta?.description;

  const belongsTo: LandingBelongsTo | undefined =
    landing?.belongsTo?.type === "place"
      ? { type: "place", placeId: landing.belongsTo.id }
      : landing?.belongsTo?.type === "campaign"
      ? { type: "campaign", campaignId: landing.belongsTo.id }
      : undefined;

  return (
    <div className="space-y-4">
      {templateDescription ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {templateDescription}
          </p>
        </div>
      ) : null}

      <BlockList
        blocks={blocks}
        fields={fields}
        disabled={disabled}
        onAdd={handleAddBlock}
        onMove={handleMove}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onSelect={selectById}
        selectedId={selectedId}
        template={template}
        belongsTo={belongsTo}
        landing={landing}
      />
    </div>
  );
}
