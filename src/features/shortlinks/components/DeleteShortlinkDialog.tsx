"use client";

import * as React from "react";
import { ConfirmByNameDialog } from "@/components/ui/confirmByNameDialog";
import { useDeleteShortlink, useShortlinkItem } from "../hooks/useShortlinkCrud";

type Props = {
  code: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteShortlinkDialog({ code, open, onOpenChange }: Props) {
  const { data: shortlink } = useShortlinkItem(open ? code : undefined);
  const deleteShortlink = useDeleteShortlink();

  const handleConfirm = async () => {
    await deleteShortlink.mutateAsync(code);
    onOpenChange(false);
  };

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Shortlink"
      description="This will disable redirects for this code and remove it from Redis."
      expectedName={shortlink?.code ?? code}
      confirmPromptLabel="Type the code"
      inputPlaceholder="Enter shortlink code"
      confirmLabel={deleteShortlink.isPending ? "Deleting…" : "Delete Shortlink"}
      confirmVariant="destructive"
      loading={deleteShortlink.isPending}
      onConfirm={handleConfirm}
      preventCloseWhileLoading
    />
  );
}
