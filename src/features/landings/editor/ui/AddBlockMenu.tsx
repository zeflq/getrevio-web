"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LandingBlockOutput } from "../../model/landingSchema";

const BLOCK_OPTIONS: { kind: LandingBlockOutput["kind"]; label: string; description: string }[] = [
  { kind: "simpleHero", label: "Simple Hero", description: "Heading + optional subtitle" },
  { kind: "heroWithCta", label: "Hero with CTA", description: "Hero plus 1-2 call-to-action buttons" },
  { kind: "legalText", label: "Legal Text", description: "Body copy for legal or compliance" },
  { kind: "game", label: "Game", description: "Interactive block for campaigns or places" },
];

type Props = {
  onAdd: (kind: LandingBlockOutput["kind"]) => void;
  disabled?: boolean;
};

export function AddBlockMenu({ onAdd, disabled }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" size="sm" className="justify-start gap-2">
          <Plus className="h-4 w-4" /> Add block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {BLOCK_OPTIONS.map((option) => (
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
