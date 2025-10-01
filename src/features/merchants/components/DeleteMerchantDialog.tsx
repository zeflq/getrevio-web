'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMerchant } from '../hooks/useMerchant';
import { useDeleteMerchant } from '../hooks/useDeleteMerchant';

export interface DeleteMerchantDialogProps {
  merchantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMerchantDialog({
  merchantId,
  open,
  onOpenChange,
}: DeleteMerchantDialogProps) {
  const [confirmName, setConfirmName] = useState('');
  const { data: merchant } = useMerchant({ id: merchantId });
  const deleteMerchant = useDeleteMerchant();

  const handleDelete = async () => {
    try {
      await deleteMerchant.mutateAsync({ id: merchantId });
      setConfirmName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete merchant:', error);
    }
  };

  const handleClose = () => {
    setConfirmName('');
    onOpenChange(false);
  };

  const isConfirmValid = confirmName === merchant?.name;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Merchant</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the merchant and all
            associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-name">
              Type <span className="font-semibold">{merchant?.name}</span> to confirm
            </Label>
            <Input
              id="confirm-name"
              placeholder="Enter merchant name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              aria-label="Confirm merchant name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || deleteMerchant.isPending}
          >
            {deleteMerchant.isPending ? 'Deleting...' : 'Delete Merchant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}