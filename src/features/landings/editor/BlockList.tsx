"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  landingBlockPluginMap,
  landingBlockPlugins,
  type LandingBlockKind,
} from "../blocks";
import type { LandingBlock } from "../blocks";
import type { TemplateBlockDefinition, LandingTemplate } from "../templates/types";
import {
  getTemplateFixedCountMap,
  getTemplateMaxInstanceMap,
} from "../templates/utils";
import { EmptyState } from "./ui/EmptyState";
import type { LandingBlockField } from "./hooks/useBlocksFieldArray";
import { SortableBlockCard } from "./SortableBlockCard";
import type { LandingBelongsTo } from "../model/landingSchema";
import type { LandingListItem } from "../server/mappers";

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

type MenuOption = {
  kind: LandingBlockKind;
  label: string;
  template?: TemplateBlockDefinition;
};

const getMenuOptions = (
  templateBlocks: TemplateBlockDefinition[] | undefined,
  blocksTranslation: (key: string) => string
): MenuOption[] => {
  if (templateBlocks && templateBlocks.length > 0) {
    return templateBlocks
      .filter((block) => block.mode === "optional")
      .map((block) => ({
        kind: block.blockType,
        label: block.label ?? block.blockType,
        template: block,
      }));
  }

  return landingBlockPlugins.map((plugin) => ({
    kind: plugin.kind,
    label: blocksTranslation(`${plugin.kind}.label`),
  }));
};

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
  const blocksTranslations = useTranslations("landings.editor.blocks");

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = fields.findIndex((field) => field.id === active.id);
    const toIndex = fields.findIndex((field) => field.id === over.id);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return;
    }

    onMove(fromIndex, toIndex);
  };

  const counts = React.useMemo(() => {
    return blocks.reduce<Record<string, number>>((acc, block) => {
      acc[block.kind] = (acc[block.kind] ?? 0) + 1;
      return acc;
    }, {});
  }, [blocks]);

  const templateLimits = React.useMemo(() => getTemplateMaxInstanceMap(template), [template]);

  const templateRequiredFixed = React.useMemo(
    () => getTemplateFixedCountMap(template),
    [template]
  );

  const menuOptions = React.useMemo(
    () => getMenuOptions(template?.blocks, blocksTranslations),
    [template, blocksTranslations]
  );

  const addOptionDisabled = (option: { kind: LandingBlockKind; template?: TemplateBlockDefinition }) => {
    const maxInstances = option.template?.maxInstances;
    if (maxInstances !== undefined && counts[option.kind] >= maxInstances) {
      return true;
    }
    return disabled ?? false;
  };

  const renderPreview = (block: LandingBlock) => {
    const plugin = landingBlockPluginMap[block.kind];
    if (plugin) {
      const Renderer = plugin.Renderer;
      return <Renderer data={block.data} />;
    }
    return (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>{blocksTranslations(`${block.kind}.label`)}</p>
      </div>
    );
  };
  if (!fields.length) {
    return (
      <div className="space-y-4 rounded-lg border border-dashed p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">{t("addBlock")}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={disabled}>{t("addBlock")}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {menuOptions.map((option) => (
                <DropdownMenuItem
                  key={option.kind}
                  disabled={addOptionDisabled(option)}
                  onSelect={() => onAdd(option.kind, option.template)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{t("addBlock")}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={disabled}>{t("addBlock")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {menuOptions.map((option) => (
              <DropdownMenuItem
                key={option.template?.id ?? option.kind}
                disabled={addOptionDisabled(option)}
                onSelect={() => onAdd(option.kind, option.template)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {fields.map((field, index) => {
              const block = blocks[index];
              if (!block) {
                return null;
              }
              return (
                <SortableBlockCard
                  key={field.id}
                  field={field}
                  block={block}
                  index={index}
                  total={fields.length}
                  selected={field.id === selectedId}
                  onSelect={() => onSelect(field.id)}
                  onMoveUp={() => onMove(index, Math.max(0, index - 1))}
                  onMoveDown={() => onMove(index, Math.min(fields.length - 1, index + 1))}
                  onDuplicate={() => onDuplicate(index)}
                  onDelete={() => onDelete(index)}
                  disabled={disabled}
                  preview={renderPreview(block)}
                  disableDuplicate={
                    templateLimits.has(block.kind) &&
                    (counts[block.kind] ?? 0) >= templateLimits.get(block.kind)!
                  }
                  disableDelete={
                    templateRequiredFixed.has(block.kind) &&
                    (counts[block.kind] ?? 0) <= templateRequiredFixed.get(block.kind)!
                  }
                  belongsTo={belongsTo}
                  landing={landing}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
