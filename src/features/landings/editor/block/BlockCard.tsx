"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, MoreHorizontal, ChevronDown, LockIcon, Pin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import { landingBlockPluginMap, type LandingBlock } from "../../blocks";
import type { LandingBelongsTo, LandingFormValues } from "../../model/landingSchema";
import type { LandingListItem } from "../../server/mappers";
import type { LandingTemplate, TemplateBlockDefinition } from "../../templates/types";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { BlockAddonsSection } from "../addons/BlockAddonsSection";

interface BlockCardAccordionProps {
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
  id,
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
}: BlockCardAccordionProps) {
  const t = useTranslations("landings.editor");
  const blocksTranslations = useTranslations("landings.editor.blocks");
  const actions = useTranslations("landings.editor.actions");

  const typeLabel = blocksTranslations(`${block.kind}.label` as const) ?? block.kind;
  const description = blocksTranslations(`${block.kind}.description` as const);
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
  const headerClasses = cn(
    "bg-background border border-border/60 rounded-lg flex items-center gap-4 px-4 py-3 text-left cursor-pointer hover:no-underline transition",
    isFixedBlock && "border-l-4 border-primary/50",
    hasBlockErrors && "border-destructive/70 bg-destructive/5 text-destructive",
  );

  return (
    <Collapsible
      open={selected}
      onOpenChange={() => {
        onSelect();
      }}
      className="bg-background rounded-lg border"
    >
      <CollapsibleTrigger asChild>
        <div
          className={headerClasses}
        >
          {/* Reorder buttons */}
          <div className="flex flex-col gap-2 text-foreground"
            onClick={(e) => {
              e.stopPropagation();
            }}
            >
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={disabled || index === 0}
              aria-label={actions("reorder")}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={disabled || index === total - 1}
              aria-label={actions("reorder")}
            >
              <ArrowDown className="size-4" />
            </Button>
          </div>

          {/* Main label and metadata */}
          <div className="flex-1 flex items-center gap-2">
            {/* {dragHandle} */}
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {t("blockNumber", { index: index + 1 })}
            </div>
            <div>
              <div className="font-semibold">{typeLabel}</div>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>

          {/* {isFixedBlock && (
            <Pin className="size-4 text-muted-foreground" />
          )} */}

          {/* Actions dropdown */}
          {(!disableDuplicate || !disableDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(buttonVariants({ variant: "ghost", size: "xs" }))}
                onClick={(e) => e.stopPropagation()}
                disabled={disabled}
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => onDuplicate()}
                  disabled={disabled || disableDuplicate}
                >
                  {actions("duplicate")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onDelete()}
                  disabled={disabled || disableDelete}
                >
                  {actions("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Chevron indicator */}
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              selected ? "rotate-180" : "rotate-0"
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 px-4 py-3">
        {InspectorComponent && (
          <InspectorComponent
            index={index}
            disabled={disabled}
            belongsTo={belongsTo}
            landing={landing}
          />
        )}
        <BlockAddonsSection index={index} disabled={disabled} templateBlock={templateBlock} />
      </CollapsibleContent>
    </Collapsible>
  );
}
