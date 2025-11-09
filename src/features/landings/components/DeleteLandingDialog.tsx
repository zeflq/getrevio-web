// src/features/landings/components/DeleteLandingDialog.tsx
"use client";

import * as React from "react";
import { ConfirmByNameDialog } from "@/components/ui/confirmByNameDialog";
import { useDeleteLanding } from "../hooks/useLandingCrud";

export interface DeleteLandingDialogProps {
  id: string;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLandingDialog({ id, name, open, onOpenChange }: DeleteLandingDialogProps) {
  const { execute, isExecuting } = useDeleteLanding<{ id: string }, { ok?: boolean }>({
    onSuccess: () => onOpenChange(false),
  });

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Landing"
      description="This action cannot be undone. This will permanently delete the landing."
      expectedName={name}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter landing name"
      confirmLabel="Delete Landing"
      confirmVariant="destructive"
      loading={isExecuting}
      onConfirm={() => execute({ id })}
      preventCloseWhileLoading
    />
  );
}
