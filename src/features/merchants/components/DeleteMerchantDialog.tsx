'use client';

import * as React from 'react';
import { ConfirmByNameDialog } from '@/components/ui/confirmByNameDialog';
import { useMerchantItem, useDeleteMerchant } from '../hooks/useMerchantCrud';

export interface DeleteMerchantDialogProps {
  merchantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMerchantDialog({ merchantId, open, onOpenChange }: DeleteMerchantDialogProps) {
  const { data: merchant } = useMerchantItem(merchantId);
  const deleteMerchant = useDeleteMerchant();

  const handleConfirm = async () => {
    await deleteMerchant.mutateAsync(merchantId);
    onOpenChange(false);
  };

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Merchant"
      description="This action cannot be undone. This will permanently delete the merchant and all associated data."
      expectedName={merchant?.name}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter merchant name"
      confirmLabel="Delete Merchant"
      confirmVariant="destructive"
      loading={deleteMerchant.isPending}
      onConfirm={handleConfirm}
      preventCloseWhileLoading
    />
  );
}