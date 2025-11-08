"use client";

import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface ReorderHandleProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  disabled?: boolean;
}

export function ReorderHandle({ attributes, listeners, disabled }: ReorderHandleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="cursor-grab text-muted-foreground"
      disabled={disabled}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
      <span className="sr-only">Reorder block</span>
    </Button>
  );
}
