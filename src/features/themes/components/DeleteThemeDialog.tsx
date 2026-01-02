"use client";

import { ConfirmByNameDialog } from "@/components/ui/confirmByNameDialog";
import { useDeleteTheme } from "../hooks/useThemeCrud";

export interface DeleteThemeDialogProps {
  themeId: string;
  themeName: string;
  merchantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteThemeDialog({
  themeId,
  themeName,
  merchantId,
  open,
  onOpenChange,
}: DeleteThemeDialogProps) {
  const { mutateAsync, isPending } = useDeleteTheme<
    { id: string; merchantId: string },
    { ok?: boolean }
  >({
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
      loading={isPending}
      onConfirm={() => mutateAsync({ id: themeId, merchantId })}
      preventCloseWhileLoading
    />
  );
}
