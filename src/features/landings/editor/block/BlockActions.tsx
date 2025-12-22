"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TemplateBlockDefinition } from "@/features/landings/templates/types";
import { useLocale } from "next-intl";
import { resolveBlockLabel, type Locale } from "../../utils/translations";

type MenuOption = {
  kind: string;
  label: string;
  template?: TemplateBlockDefinition;
};

function getMenuOptions(
  templateBlocks: TemplateBlockDefinition[] | [],
  locale: Locale
) {
  if (templateBlocks && templateBlocks.length > 0) {
    return templateBlocks
      .filter((block) => block.mode === "optional")
      .map((block) => ({
        kind: block.kind,
        label: block.label ?? resolveBlockLabel(block.kind, locale),
        template: block,
      }));
  }
  return [];
}

type BlockActionsProps = {
  disabled?: boolean;
  buttonLabel: string;
  templateBlocks?: TemplateBlockDefinition[] | null;
  addOptionDisabled?: (option: MenuOption) => boolean;
  onSelect: (kind: string, template?: TemplateBlockDefinition) => void;
};

export function BlockActions({
  disabled,
  buttonLabel,
  templateBlocks,
  addOptionDisabled,
  onSelect,
}: BlockActionsProps) {
  const locale = useLocale() as Locale;

  const menuOptions = React.useMemo(
    () => getMenuOptions(templateBlocks ?? [], locale),
    [templateBlocks, locale]
  );

  return (
    menuOptions && menuOptions.length > 0 && (
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={disabled} variant="primaryOutline">{buttonLabel}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {menuOptions.map((option) => (
            <DropdownMenuItem
              key={option.template?.id ?? option.kind}
              disabled={disabled || Boolean(addOptionDisabled?.(option))}
              onSelect={() => onSelect(option.kind, option.template)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ));
}
