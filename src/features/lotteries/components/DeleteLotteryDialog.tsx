"use client";

import { ConfirmByNameDialog } from "@/components/ui/confirmByNameDialog";
import { useDeleteLottery } from "@/features/lotteries/hooks/useLotteryCrud";

export interface DeleteLotteryDialogProps {
  id: string;
  name?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLotteryDialog({ id, name, open, onOpenChange }: DeleteLotteryDialogProps) {
  const { mutateAsync, isPending } = useDeleteLottery<{ id: string }, { ok?: true }>({
    onSuccess: () => onOpenChange(false),
  });

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Lottery"
      description="This will permanently remove the lottery configuration."
      expectedName={name}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter lottery name"
      confirmLabel="Delete Lottery"
      confirmVariant="destructive"
      loading={isPending}
      onConfirm={async () => {
        await mutateAsync({ id });
      }}
      preventCloseWhileLoading
    />
  );
}
