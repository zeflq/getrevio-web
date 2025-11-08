"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LandingBlockOutput } from "../../model/landingSchema";

type Props = {
  onAdd: (kind: LandingBlockOutput["kind"]) => void;
  disabled?: boolean;
};

export function AddBlockMenu({ onAdd, disabled }: Props) {
  const t = useTranslations("landings.editor");
  const blocksT = useTranslations("landings.editor.blocks");
  const options: { kind: LandingBlockOutput["kind"]; label: string; description: string }[] = [
    { kind: "simpleHero", label: blocksT("simpleHero.label"), description: blocksT("simpleHero.description") },
    { kind: "heroWithCta", label: blocksT("heroWithCta.label"), description: blocksT("heroWithCta.description") },
    { kind: "legalText", label: blocksT("legalText.label"), description: blocksT("legalText.description") },
    { kind: "game", label: blocksT("game.label"), description: blocksT("game.description") },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" size="sm" className="justify-start gap-2">
          <Plus className="h-4 w-4" /> {t("addBlock")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.kind}
            className="flex flex-col items-start space-y-1"
            onClick={() => onAdd(option.kind)}
          >
            <span className="text-sm font-medium">{option.label}</span>
            <span className="text-xs text-muted-foreground">{option.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
