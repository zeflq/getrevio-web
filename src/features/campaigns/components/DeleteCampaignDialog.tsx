// src/features/campaigns/components/DeleteCampaignDialog.tsx
"use client";

import * as React from "react";
import { ConfirmByNameDialog } from "@/components/ui/confirmByNameDialog";
import { useCampaignItem, useDeleteCampaign } from "../hooks/useCampaignCrud";

export interface DeleteCampaignDialogProps {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCampaignDialog({
  campaignId,
  open,
  onOpenChange,
}: DeleteCampaignDialogProps) {
  const { data: campaign } = useCampaignItem(campaignId);
  const deleteCampaign = useDeleteCampaign();

  const handleConfirm = async () => {
    await deleteCampaign.mutateAsync(campaignId);
    onOpenChange(false);
  };

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Campaign"
      description="This action cannot be undone. This will permanently delete the campaign and related data."
      expectedName={campaign?.name}
      confirmPromptLabel="Type"
      inputPlaceholder="Enter campaign name"
      confirmLabel="Delete Campaign"
      confirmVariant="destructive"
      loading={deleteCampaign.isPending}
      onConfirm={handleConfirm}
      preventCloseWhileLoading
    />
  );
}
