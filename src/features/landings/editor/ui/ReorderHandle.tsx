"use client";

import { GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface ReorderHandleProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  disabled?: boolean;
}

export function ReorderHandle({ attributes, listeners, disabled }: ReorderHandleProps) {
  const t = useTranslations("landings.editor.actions");
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
      <span className="sr-only">{t("reorder")}</span>
    </Button>
  );
}
