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
import { useTranslations } from "next-intl";

type MenuOption = {
  kind: string;
  label: string;
  template?: TemplateBlockDefinition;
};

function getMenuOptions(
  templateBlocks: TemplateBlockDefinition[] | [],
  t: ReturnType<typeof useTranslations>
) {
  if (templateBlocks && templateBlocks.length > 0) {
    return templateBlocks
      .filter((block) => block.mode === "optional")
      .map((block) => ({
        kind: block.kind,
        label: t(`${block.kind}.name`) ?? block.kind,
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
  const t = useTranslations("landings.templates");

  const menuOptions = React.useMemo(
    () => getMenuOptions(templateBlocks ?? [], t),
    [templateBlocks, t]
  );

  return (
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
  );
}
