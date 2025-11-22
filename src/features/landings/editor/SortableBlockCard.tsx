"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import * as React from "react";

import type { LandingBlock } from "../blocks";
import type { LandingBlockField } from "./hooks/useBlocksFieldArray";
import { BlockCard } from "./BlockCard";
import type { LandingBelongsTo } from "../model/landingSchema";
import type { LandingListItem } from "../server/mappers";
import type { LandingTemplate } from "../templates/types";

interface SortableBlockCardProps {
  field: LandingBlockField;
  block: LandingBlock;
  index: number;
  total: number;
  selected: boolean;
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

export function SortableBlockCard({
  field,
  block,
  index,
  total,
  selected,
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
}: SortableBlockCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id,
  });

  const style = React.useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  return (
    <div ref={setNodeRef} style={style}>
      <BlockCard
        id={field.id}
        block={block}
        index={index}
        total={total}
        selected={selected}
        onSelect={onSelect}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        disabled={disabled}
        disableDuplicate={disableDuplicate}
        disableDelete={disableDelete}
        belongsTo={belongsTo}
        landing={landing}
        template={template}
      />
    </div>
  );
}
