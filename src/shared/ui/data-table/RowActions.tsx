"use client";

import * as React from "react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

type Common = {
  id: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

/**
 * Renders ONLY the menu items (no trigger, no content wrapper).
 * Use inside a DropdownMenuContent (table action button or CardDataTable menu).
 */
export function RowActionsMenuItems({ id, onView, onEdit, onDelete }: Common) {
  return (
    <>
      {onView && <DropdownMenuItem onSelect={() => onView(id)}>View</DropdownMenuItem>}
      {onEdit && <DropdownMenuItem onSelect={() => onEdit(id)}>Edit</DropdownMenuItem>}
      {(onView || onEdit) && onDelete && <DropdownMenuSeparator />}
      {onDelete && (
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => onDelete(id)}
        >
          Delete
        </DropdownMenuItem>
      )}
    </>
  );
}
