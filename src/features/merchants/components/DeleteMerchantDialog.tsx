'use client';

import * as React from 'react';
import { ConfirmByNameDialog } from '@/components/ui/confirmByNameDialog';
import { useDeleteMerchant } from '../hooks/useMerchantCrud';

export interface DeleteMerchantDialogProps {
  merchantName: string;
  merchantId: string; // still needed for the deletion call itself
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMerchantDialog({
  merchantId,
  merchantName,
  open,
  onOpenChange,
}: DeleteMerchantDialogProps) {
  const { execute, isExecuting } = useDeleteMerchant<{ id: string }, { ok?: boolean }>({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleConfirm = () => {
    execute({ id: merchantId });
  };

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Merchant"
      description="This action cannot be undone. This will permanently delete the merchant and all associated data."
      expectedName={merchantName}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter merchant name"
      confirmLabel="Delete Merchant"
      confirmVariant="destructive"
      loading={isExecuting}
      onConfirm={handleConfirm}
      preventCloseWhileLoading
    />
  );
}
