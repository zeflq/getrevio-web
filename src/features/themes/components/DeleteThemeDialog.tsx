"use client";

import * as React from "react";
import { ConfirmByNameDialog } from "@/components/ui/confirmByNameDialog";
import { useThemeItem, useDeleteTheme } from "../hooks/useThemeCrud";

export interface DeleteThemeDialogProps {
  themeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteThemeDialog({ themeId, open, onOpenChange }: DeleteThemeDialogProps) {
  const { data: theme } = useThemeItem(themeId);
  const deleteTheme = useDeleteTheme();

  const handleConfirm = async () => {
    await deleteTheme.mutateAsync(themeId);
    onOpenChange(false);
  };

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Theme"
      description="This action cannot be undone. This will permanently delete the theme."
      expectedName={theme?.name}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter theme name"
      confirmLabel="Delete Theme"
      confirmVariant="destructive"
      loading={deleteTheme.isPending}
      onConfirm={handleConfirm}
      preventCloseWhileLoading
    />
  );
}