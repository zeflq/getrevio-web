"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import type { LandingBelongsTo, LandingFormValues } from "../model/landingSchema";
import type { LandingListItem } from "../server/mappers";
import { SimpleHeroInspector } from "./inspectors/SimpleHeroInspector";
import { HeroWithCtaInspector } from "./inspectors/HeroWithCtaInspector";
import { LegalTextInspector } from "./inspectors/LegalTextInspector";
import { GameInspector } from "./inspectors/GameInspector";

interface BlockInspectorProps {
  selectedIndex: number;
  disabled?: boolean;
  onConvertHero?: (index: number, targetKind: "heroWithCta") => void;
  belongsTo?: LandingBelongsTo;
  landing?: LandingListItem;
}

export function BlockInspector({
  selectedIndex,
  disabled,
  onConvertHero,
  belongsTo,
  landing,
}: BlockInspectorProps) {
  const { watch } = useFormContext<LandingFormValues>();
  const block = watch(`content.blocks.${selectedIndex}`);

  if (selectedIndex === -1 || !block) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        Select a block to edit its content.
      </div>
    );
  }

  const contextLabel =
    belongsTo?.type === "campaign"
      ? landing?.belongsTo?.label ?? belongsTo?.campaignId ?? "Linked campaign"
      : landing?.belongsTo?.label ?? belongsTo?.placeId ?? "Linked place";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{formatBlockLabel(block.kind)}</Badge>
        <p className="text-sm text-muted-foreground">Block #{selectedIndex + 1}</p>
      </div>

      <div className="rounded-lg border p-4">
        {block.kind === "simpleHero" && (
          <SimpleHeroInspector
            index={selectedIndex}
            disabled={disabled}
            onConvert={() => onConvertHero?.(selectedIndex, "heroWithCta")}
          />
        )}
        {block.kind === "heroWithCta" && (
          <HeroWithCtaInspector index={selectedIndex} disabled={disabled} />
        )}
        {block.kind === "legalText" && (
          <LegalTextInspector index={selectedIndex} disabled={disabled} />
        )}
        {block.kind === "game" && (
          <GameInspector
            index={selectedIndex}
            disabled={disabled}
            contextLabel={contextLabel}
            belongsTo={belongsTo}
          />
        )}
      </div>
    </div>
  );
}

function formatBlockLabel(kind: string) {
  switch (kind) {
    case "heroWithCta":
      return "Hero with CTA";
    case "legalText":
      return "Legal Text";
    case "game":
      return "Game";
    case "simpleHero":
    default:
      return "Simple Hero";
  }
}
