// src/features/campaigns/components/DeleteCampaignDialog.tsx
"use client";

import * as React from "react";
import { ConfirmByNameDialog } from "@/components/ui/confirmByNameDialog";
import { useDeleteCampaign } from "../hooks/useCampaignCrud";

export interface DeleteCampaignDialogProps {
  campaignId: string;
  campaignName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCampaignDialog({
  campaignId,
  campaignName,
  open,
  onOpenChange,
}: DeleteCampaignDialogProps) {
  const { execute, isExecuting } = useDeleteCampaign<
    { id: string },
    { ok?: boolean }
  >({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleConfirm = () => {
    execute({ id: campaignId });
  };

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Campaign"
      description="This action cannot be undone. This will permanently delete the campaign and related data."
      expectedName={campaignName}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter campaign name"
      confirmLabel="Delete Campaign"
      confirmVariant="destructive"
      loading={isExecuting}
      onConfirm={handleConfirm}
      preventCloseWhileLoading
    />
  );
}
