"use client";

import * as React from "react";
import { Copy, Eye } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FieldArrayWithId } from "react-hook-form";

import type { LandingFormValues, LandingBlockOutput } from "../model/landingSchema";
import { ReorderHandle } from "./ui/ReorderHandle";
import { ConfirmDeleteDialog } from "./ui/ConfirmDeleteDialog";

interface BlockCardProps {
  field: FieldArrayWithId<LandingFormValues, "content.blocks", "id">;
  block?: LandingBlockOutput;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function BlockCard({
  field,
  block,
  isSelected,
  disabled,
  onSelect,
  onDuplicate,
  onDelete,
}: BlockCardProps) {
  const sortable = useSortable({ id: field.id, disabled });
  const [showPreview, setShowPreview] = React.useState(false);

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card p-3 text-left text-sm",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border",
        sortable.isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <ReorderHandle
          attributes={sortable.attributes}
          listeners={sortable.listeners}
          disabled={disabled}
        />
        <div className="flex-1 space-y-1">
          <p className="font-medium">{formatBlockLabel(block?.kind)}</p>
          <p className="text-xs text-muted-foreground">{getBlockSummary(block)}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Duplicate block</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              setShowPreview((prev) => !prev);
            }}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Toggle preview</span>
          </Button>
          <ConfirmDeleteDialog
            disabled={disabled}
            onConfirm={() => {
              onDelete();
            }}
          />
        </div>
      </div>
      {showPreview && (
        <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
          {renderPreview(block)}
        </div>
      )}
    </div>
  );
}

function formatBlockLabel(kind?: string) {
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

function getBlockSummary(block?: LandingBlockOutput) {
  if (!block) return "No content";
  switch (block.kind) {
    case "simpleHero":
      return block.subtitle ? `${block.title} · ${block.subtitle}` : block.title;
    case "heroWithCta":
      return `${block.title} · ${block.ctas.length} CTA${block.ctas.length > 1 ? "s" : ""}`;
    case "legalText":
      return block.text.slice(0, 60) + (block.text.length > 60 ? "…" : "");
    case "game":
      return block.ctaLabel ? `CTA: ${block.ctaLabel}` : "No CTA label";
    default:
      return "Block";
  }
}

function renderPreview(block?: LandingBlockOutput) {
  if (!block) return "Empty block";
  switch (block.kind) {
    case "simpleHero":
      return (
        <div>
          <p className="font-medium text-foreground">{block.title}</p>
          {block.subtitle && <p>{block.subtitle}</p>}
        </div>
      );
    case "heroWithCta":
      return (
        <div className="space-y-2">
          <p className="font-medium text-foreground">{block.title}</p>
          {block.subtitle && <p>{block.subtitle}</p>}
          <ul className="space-y-1">
            {block.ctas.map((cta) => (
              <li key={cta.label}>
                <span className="font-medium">{cta.label}</span> · {cta.url}
              </li>
            ))}
          </ul>
        </div>
      );
    case "legalText":
      return <p>{block.text}</p>;
    case "game":
      return <p>CTA label: {block.ctaLabel ?? "none"}</p>;
    default:
      return "Preview unavailable";
  }
}
