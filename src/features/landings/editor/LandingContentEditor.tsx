"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import type { LandingListItem } from "../server/mappers";
import type { LandingBlockOutput, LandingFormValues } from "../model/landingSchema";
import { createBlockByKind, createSimpleHeroBlock } from "../lib/landingContent.presets";
import { BlockList } from "./BlockList";
import { BlockInspector } from "./BlockInspector";
import { useBlocksFieldArray } from "./hooks/useBlocksFieldArray";
import { useSelectedBlock } from "./hooks/useSelectedBlock";
import { useEditorWarnings } from "./hooks/useEditorWarnings";

interface LandingContentEditorProps {
  landing?: LandingListItem;
  disabled?: boolean;
}

export function LandingContentEditor({ landing, disabled }: LandingContentEditorProps) {
  const form = useFormContext<LandingFormValues>();
  const { fields, append, remove, insert, move, update } = useBlocksFieldArray();
  const { selectedId, selectedIndex, selectById, selectByIndex } = useSelectedBlock(fields);
  const warnings = useEditorWarnings();
  const blocks = (form.watch("content.blocks") ?? []) as LandingBlockOutput[];
  const belongsTo = form.watch("belongsTo");

  React.useEffect(() => {
    if (fields.length === 0) {
      append(createSimpleHeroBlock());
    }
  }, [append, fields.length]);

  const handleAddBlock = (kind: LandingBlockOutput["kind"]) => {
    append(createBlockByKind(kind));
    selectByIndex(fields.length);
  };

  const handleDuplicate = (index: number) => {
    const block = form.getValues(`content.blocks.${index}`) as LandingBlockOutput;
    const clone = JSON.parse(JSON.stringify(block ?? createSimpleHeroBlock()));
    insert(index + 1, clone);
    selectByIndex(index + 1);
  };

  const handleDelete = (index: number) => {
    if (fields.length === 1) {
      update(0, createSimpleHeroBlock());
      return;
    }
    remove(index);
  };

  const handleMove = (from: number, to: number) => {
    move(from, to);
  };

  const handleConvertHero = (index: number, targetKind: "heroWithCta") => {
    const block = form.getValues(`content.blocks.${index}`) as LandingBlockOutput | undefined;
    const overrides =
      block?.kind === "simpleHero"
        ? { title: block.title, subtitle: block.subtitle }
        : undefined;
    update(index, createBlockByKind(targetKind, overrides));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <BlockList
        fields={fields}
        blocks={blocks}
        selectedId={selectedId}
        onSelect={selectById}
        onAdd={handleAddBlock}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onMove={handleMove}
        disabled={disabled}
        warnings={warnings}
      />
      <BlockInspector
        selectedIndex={selectedIndex}
        disabled={disabled}
        onConvertHero={handleConvertHero}
        belongsTo={belongsTo}
        landing={landing}
      />
    </div>
  );
}
