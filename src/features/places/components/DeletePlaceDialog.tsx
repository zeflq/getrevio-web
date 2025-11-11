'use client';

import * as React from 'react';
import { ConfirmByNameDialog } from '@/components/ui/confirmByNameDialog';
import { useDeletePlace } from '../hooks/usePlaceCrud';

export interface DeletePlaceDialogProps {
  id: string;
  localName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePlaceDialog({ id, localName, open, onOpenChange }: DeletePlaceDialogProps) {
  const { execute, isExecuting } = useDeletePlace<{ id: string }, { ok?: boolean }>({
    onSuccess: () => onOpenChange(false),
    extraInvalidateKeys:[["googlePlaces"]]
  });

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Place"
      description="This action cannot be undone. This will permanently delete the place and related data."
      expectedName={localName}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter place name"
      confirmLabel="Delete Place"
      confirmVariant="destructive"
      loading={isExecuting}
      onConfirm={() => execute({ id })}
      preventCloseWhileLoading
    />
  );
}
