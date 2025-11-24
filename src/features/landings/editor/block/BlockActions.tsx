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

type MenuOption = {
  kind: string;
  label: string;
  template?: TemplateBlockDefinition;
};

const getMenuOptions = (templateBlocks?: TemplateBlockDefinition[] | []) => {
  if (templateBlocks && templateBlocks.length > 0) {
    return templateBlocks
      .filter((block) => block.mode === "optional")
      .map((block) => ({
        kind: block.kind,
        label: block.label ?? block.kind,
        template: block,
      }));
  }
  return [];
};

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
  const menuOptions = React.useMemo(
    () => getMenuOptions(templateBlocks ?? []),
    [templateBlocks]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={disabled}>{buttonLabel}</Button>
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
  );
}
