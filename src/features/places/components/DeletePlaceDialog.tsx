'use client';

import * as React from 'react';
import { ConfirmByNameDialog } from '@/components/ui/confirmByNameDialog';
import { usePlaceItem, useDeletePlace } from '../hooks/usePlaceCrud';

export interface DeletePlaceDialogProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePlaceDialog({ id, open, onOpenChange }: DeletePlaceDialogProps) {
  const { data: place } = usePlaceItem(id);
  const deletePlace = useDeletePlace();

  const handleConfirm = async () => {
    await deletePlace.mutateAsync(id);
    onOpenChange(false);
  };

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Place"
      description="This action cannot be undone. This will permanently delete the place and related data."
      expectedName={place?.localName}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter place name"
      confirmLabel="Delete Place"
      confirmVariant="destructive"
      loading={deletePlace.isPending}
      onConfirm={handleConfirm}
      preventCloseWhileLoading
    />
  );
}