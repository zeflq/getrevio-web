"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import { landingBlockPluginMap, type LandingBlock } from "../../blocks";
import type { LandingBelongsTo, LandingFormValues } from "../../model/landingSchema";
import type { LandingListItem } from "../../server/mappers";
import type { LandingTemplate, TemplateBlockDefinition } from "../../templates/types";
import { resolveBlockLabel, resolveBlockDescription, type Locale } from "../../utils/translations";

import { BlockAddonsSection } from "../addons/BlockAddonsSection";
import { EditorCard } from "../ui/EditorCard";

interface BlockCardProps {
  id: string;
  block: LandingBlock;
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
  belongsTo?: LandingBelongsTo | null;
  landing?: LandingListItem | null;
  template?: LandingTemplate | null;
}

export function BlockCard({
  block,
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
  belongsTo,
  landing,
  template,
}: BlockCardProps) {
  const t = useTranslations("landings.editor");
  const locale = useLocale() as Locale;

  // Resolve block label with fallback chain:
  // 1. __templateLabel (stored translated text from template)
  // 2. KIND i18n (portable)
  // 3. Kind itself
  const typeLabel = block.__templateLabel ?? resolveBlockLabel(block.kind, locale);

  // Resolve block description from KIND i18n
  const description = resolveBlockDescription(block.kind, locale);

  const plugin = landingBlockPluginMap[block.kind];
  const InspectorComponent = plugin?.Inspector;

  const templateBlock: TemplateBlockDefinition | null = React.useMemo(() => {
    if (!template || !block.__templateBlockId) return null;
    return template.blocks.find((entry) => entry.id === block.__templateBlockId) ?? null;
  }, [template, block.__templateBlockId]);

  const isFixedBlock = block.__templateFixed ?? false;

  const { formState } = useFormContext<LandingFormValues>();
  const blockErrors = formState.errors.content?.blocks?.[index];
  const hasBlockErrors = Boolean(blockErrors);

  return (
    <EditorCard
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      isFixed={isFixedBlock}
      hasErrors={hasBlockErrors}
      
      canMoveUp={index > 0 && !isFixedBlock}
      canMoveDown={index < total - 1  && !isFixedBlock}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}

      canDuplicate={!disableDuplicate}
      canDelete={!disableDelete}
      onDuplicate={onDuplicate}
      onDelete={onDelete}

      header={
        <>
          {total> 1 && (
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {t("blockNumber", { index: index + 1 })} 
            </div>
          )}
          <div>
            <div className="font-semibold text-sm sm:text-base">{typeLabel}</div>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 sm:line-clamp-none">{description}</p>
            )}
          </div>
        </>
      }

      content={
        <>
          {InspectorComponent && (
            <InspectorComponent
              index={index}
              disabled={disabled}
              belongsTo={belongsTo}
              landing={landing}
            />
          )}

          <BlockAddonsSection
            blockIndex={index}
            disabled={disabled}
            templateBlock={templateBlock}
          />
        </>
      }
    />
  );
}
