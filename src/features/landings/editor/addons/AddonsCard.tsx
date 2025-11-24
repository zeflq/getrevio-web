"use client";

import * as React from "react";
import {
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  ChevronDown,
  Pin,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import type { LandingFormValues } from "../../model/landingSchema";
import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { landingAddonPluginMap } from "../../addons";
import type { LandingAddon } from "../../addons"; // if you want proper typing

interface AddonsCardProps {
  id: string;
  addon: LandingAddon; // was any
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
  const actions = useTranslations("landings.editor.actions");

  const plugin = landingAddonPluginMap[addon.kind];
  const InspectorComponent = plugin?.Inspector;

  const typeLabel =
    addonsTranslations(`${addon.kind}.label` as const) ?? addon.kind;
  const description = addonsTranslations(`${addon.kind}.description` as const);

  const isFixedAddon = addon.__templateFixed ?? false;

  const { formState } = useFormContext<LandingFormValues>();
  const addonErrors =
    (formState.errors.content?.blocks?.[blockIndex] as any)?.addons?.[index];
  const hasAddonErrors = Boolean(addonErrors);

  const headerClasses = cn(
    "bg-background border border-border/60 rounded-lg flex items-center gap-4 px-4 py-3 text-left cursor-pointer hover:no-underline transition",
    isFixedAddon && "border-l-4 border-primary/40",
    hasAddonErrors && "border-destructive/70 bg-destructive/5 text-destructive"
  );

  // ✅ REQUIRED by LandingAddonInspectorProps
  const fieldName = `content.blocks.${blockIndex}.addons.${index}.data`;

  return (
    <Collapsible
      open={selected}
      onOpenChange={() => onSelect()}
      className="bg-background rounded-lg border"
    >
      <CollapsibleTrigger asChild>
        <div className={headerClasses}>
          {/* Reorder buttons */}
          <div
            className="flex flex-col gap-2 text-foreground"
            onClick={(e) => e.stopPropagation()}
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
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {t("addonNumber", { index: index + 1 })}
            </div>
            <div>
              <div className="font-semibold">{typeLabel}</div>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>

          {/* {isFixedAddon && <Pin className="size-4 text-muted-foreground" />} */}

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

          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              selected ? "rotate-180" : "rotate-0"
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 px-4 py-3">
        {InspectorComponent ? (
          <InspectorComponent
            blockIndex={blockIndex}
            addonIndex={index}
            fieldName={fieldName}   // ✅ FIX
            disabled={disabled}
          />
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
