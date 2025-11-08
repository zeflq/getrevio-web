"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { FieldArrayWithId } from "react-hook-form";

import type { LandingFormValues, LandingBlockOutput } from "../model/landingSchema";
import { AddBlockMenu } from "./ui/AddBlockMenu";
import { EmptyState } from "./ui/EmptyState";
import { BlockCard } from "./BlockCard";

interface BlockListProps {
  fields: FieldArrayWithId<LandingFormValues, "content.blocks", "id">[];
  blocks: LandingBlockOutput[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (kind: LandingBlockOutput["kind"]) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (activeIndex: number, overIndex: number) => void;
  disabled?: boolean;
  warnings: string[];
}

export function BlockList({
  fields,
  blocks,
  selectedId,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
  disabled,
  warnings,
}: BlockListProps) {
  const t = useTranslations("landings.editor");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeIndex = fields.findIndex((field) => field.id === active.id);
    const overIndex = fields.findIndex((field) => field.id === over.id);
    if (activeIndex !== -1 && overIndex !== -1) {
      onMove(activeIndex, overIndex);
    }
  };

  return (
    <div className="space-y-4">
      <AddBlockMenu onAdd={onAdd} disabled={disabled} />

      {warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{t("warningsTitle")}</span>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {fields.length === 0 ? (
        <EmptyState />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {fields.map((field, index) => (
                <BlockCard
                  key={field.id}
                  field={field}
                  block={blocks[index]}
                  isSelected={field.id === selectedId}
                  disabled={disabled}
                  onSelect={() => onSelect(field.id)}
                  onDuplicate={() => onDuplicate(index)}
                  onDelete={() => onDelete(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
