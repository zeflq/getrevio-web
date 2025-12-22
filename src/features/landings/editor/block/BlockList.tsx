"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import type { LandingBlock, LandingBlockKind } from "../../blocks";
import type {
  TemplateBlockDefinition,
  LandingTemplate,
} from "../../templates/types";
import {
  getTemplateFixedCountMap,
  getTemplateMaxInstanceMap,
} from "../../templates/utils";

import { EmptyState } from "../ui/EmptyState";
import type { LandingBlockField } from "../hooks/useBlocksFieldArray";
import type { LandingBelongsTo } from "../../model/landingSchema";
import type { LandingListItem } from "../../server/mappers";

import { BlockActions } from "./BlockActions";
import { BlockCard } from "./BlockCard";

interface BlockListProps {
  blocks: LandingBlock[];
  fields: LandingBlockField[];
  onAdd: (kind: LandingBlockKind, templateBlock?: TemplateBlockDefinition) => void;
  onMove: (from: number, to: number) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  template?: LandingTemplate | null;
  disabled?: boolean;
  belongsTo?: LandingBelongsTo | null;
  landing?: LandingListItem | null;
}

export function BlockList({
  blocks,
  fields,
  onAdd,
  onMove,
  onDelete,
  onDuplicate,
  selectedId,
  onSelect,
  template,
  disabled,
  belongsTo,
  landing,
}: BlockListProps) {
  const t = useTranslations("landings.editor");

  const counts = React.useMemo(() => {
    return blocks.reduce<Record<string, number>>((acc, block) => {
      acc[block.kind] = (acc[block.kind] ?? 0) + 1;
      return acc;
    }, {});
  }, [blocks]);

  const templateLimits = React.useMemo(
    () => getTemplateMaxInstanceMap(template),
    [template]
  );

  const templateRequiredFixed = React.useMemo(
    () => getTemplateFixedCountMap(template),
    [template]
  );

  const addOptionDisabled = (option: {
    kind: LandingBlockKind;
    template?: TemplateBlockDefinition;
  }) => {
    const maxInstances = option.template?.maxInstances;
    if (maxInstances !== undefined && counts[option.kind] >= maxInstances) {
      return true;
    }
    return disabled ?? false;
  };

  if (!fields.length) {
    return (
      <div className="space-y-4 rounded-lg border border-dashed p-6">
        {template?.blocks && template.blocks.length > 0 && (
          <BlockActions
            disabled={disabled}
            buttonLabel={t("addBlock")}
            templateBlocks={template.blocks}
            addOptionDisabled={addOptionDisabled}
            onSelect={(kind, templateBlock) =>
              onAdd(kind as LandingBlockKind, templateBlock)
            }
          />
        )}
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BlockActions
        disabled={disabled}
        buttonLabel={t("addBlock")}
        templateBlocks={template?.blocks}
        addOptionDisabled={addOptionDisabled}
        onSelect={(kind, templateBlock) =>
          onAdd(kind as LandingBlockKind, templateBlock)
        }
      />

      <div className="space-y-3">
        {fields.map((field, index) => {
          const block = blocks[index];
          if (!block) return null;

          return (
            <BlockCard
              key={field.id}
              id={field.id}
              block={block}
              index={index}
              total={fields.length}
              selected={field.id === selectedId}
              onSelect={() => onSelect(field.id)}
              onMoveUp={() => onMove(index, Math.max(0, index - 1))}
              onMoveDown={() =>
                onMove(index, Math.min(fields.length - 1, index + 1))
              }
              onDuplicate={() => onDuplicate(index)}
              onDelete={() => onDelete(index)}
              disabled={disabled}
              disableDuplicate={
                templateLimits.has(block.kind) &&
                (counts[block.kind] ?? 0) >= templateLimits.get(block.kind)!
              }
              disableDelete={
                templateRequiredFixed.has(block.kind) &&
                (counts[block.kind] ?? 0) <=
                  templateRequiredFixed.get(block.kind)!
              }
              belongsTo={belongsTo}
              landing={landing}
              template={template}
            />
          );
        })}
      </div>
    </div>
  );
}
