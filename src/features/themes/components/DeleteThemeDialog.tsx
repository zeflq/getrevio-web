"use client";

import * as React from "react";
import { ConfirmByNameDialog } from "@/components/ui/confirmByNameDialog";
import { useThemeItem, useDeleteTheme } from "../hooks/useThemeCrud";

export interface DeleteThemeDialogProps {
  themeId: string;
  themeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteThemeDialog({ themeId, themeName, open, onOpenChange }: DeleteThemeDialogProps) {
  const { execute, isExecuting } = useDeleteTheme<{ id: string }, { ok?: boolean }>({
    onSuccess: () => onOpenChange(false),
  });

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Theme"
      description="This action cannot be undone. This will permanently delete the theme."
      expectedName={themeName}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter theme name"
      confirmLabel="Delete Theme"
      confirmVariant="destructive"
      loading={isExecuting}
      onConfirm={() => execute({ id: themeId })}
      preventCloseWhileLoading
    />
  );
}
