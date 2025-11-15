"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createBlockByKind, type LandingBlock, type LandingBlockKind } from "../blocks";
import type { LandingBelongsTo, LandingFormValues } from "../model/landingSchema";
import type { LandingListItem } from "../server/mappers";
import { landingTemplates } from "../templates";
import type { TemplateBlockDefinition } from "../templates/types";
import { getTemplateFixedCountMap } from "../templates/utils";
import { useBlocksFieldArray } from "./hooks/useBlocksFieldArray";
import { useSelectedBlock } from "./hooks/useSelectedBlock";
import { BlockList } from "./BlockList";

interface LandingContentEditorProps {
  landing?: LandingListItem | null;
  disabled?: boolean;
}

export function LandingContentEditor({ landing, disabled }: LandingContentEditorProps) {
  const t = useTranslations("landings.editor");
  const form = useFormContext<LandingFormValues>();
  const blocks =
    (useWatch<LandingFormValues, "content.blocks">({
      name: "content.blocks",
      control: form.control,
    }) ?? []) as LandingBlock[];

  const {
    fields,
    append,
    insert,
    move,
    remove,
  } = useBlocksFieldArray();

  const { selectedId, selectById, selectByIndex } = useSelectedBlock(fields);

  const [templateId, setTemplateId] = React.useState<string | null>(() =>
    landing?.contentDraft.templateId ?? landingTemplates[0]?.id ?? null
  );

  React.useEffect(() => {
    if (landing?.contentDraft.templateId && landing.contentDraft.templateId !== templateId) {
      setTemplateId(landing.contentDraft.templateId);
      return;
    }
    if (!landing && templateId === null && landingTemplates[0]) {
      setTemplateId(landingTemplates[0].id);
    }
  }, [landing?.contentDraft.templateId, landing, templateId]);

  React.useEffect(() => {
    form.setValue("content.templateId", templateId, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [form, templateId]);

  const template = React.useMemo(
    () => landingTemplates.find((entry) => entry.id === templateId) ?? null,
    [templateId]
  );

  const templateRequiredFixed = React.useMemo(
    () => getTemplateFixedCountMap(template),
    [template]
  );

  const hasSeededTemplate = React.useRef(false);
  React.useEffect(() => {
    if (hasSeededTemplate.current) {
      return;
    }
    const fixedSlots = template?.blocks?.filter((definition) => definition.mode === "fixed") ?? [];
    if (!fixedSlots.length) {
      return;
    }
    if (blocks.length > 0) {
      return;
    }

    hasSeededTemplate.current = true;

    fixedSlots.forEach((definition) => {
      const block = createBlockByKind(definition.blockType, definition.defaultData as any);
      block.__templateBlockId = definition.id;
      block.__templateFixed = true;
      append(block);
    });
  }, [append, blocks.length, template]);

  const handleAddBlock = (kind: LandingBlockKind, templateBlock?: TemplateBlockDefinition) => {
    const block = createBlockByKind(kind, templateBlock?.defaultData as any);
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
    if (!source) {
      return;
    }
    const duplicate = createBlockByKind(source.kind, source.data as any);
    insert(index + 1, duplicate);
    selectByIndex(index + 1);
  };

  const handleDelete = (index: number) => {
    const block = blocks[index];
    if (!block) {
      return;
    }

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

  const templateLabel = t("templates.label");
  const templatePlaceholder = t("templates.placeholder");
  const templateDescriptionLabel = t("templates.description");
  const locale = useLocale();
  const templateDescription =
    template?.description?.[locale as "en" | "fr"] ?? template?.description?.en;

  const belongsTo : LandingBelongsTo | undefined =
    landing?.belongsTo?.type === "place"
      ? { type: "place", placeId: landing.belongsTo.id }
      : landing?.belongsTo?.type === "campaign"
      ? { type: "campaign", campaignId: landing.belongsTo.id }
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-lg border border-border p-4 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">{t("addBlock")}</p>
          <p className="text-sm text-muted-foreground">{t("selectPrompt")}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">{templateLabel}</span>
          <Select value={templateId ?? ""} onValueChange={(value) => setTemplateId(value || null)}>
            <SelectTrigger className="h-9 w-48">
              <SelectValue placeholder={templatePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {landingTemplates.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {templateDescription ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {templateDescriptionLabel}
          </p>
          <p>{templateDescription}</p>
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
