"use client";

import * as React from "react";
import { ConfirmByNameDialog } from "@/components/ui/confirmByNameDialog";
import { useDeleteShortlink } from "../hooks/useShortlinkCrud";

type Props = {
  id: string;
  code: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteShortlinkDialog({ id, code, open, onOpenChange }: Props) {
  const { execute, isExecuting } = useDeleteShortlink<
    { id: string },
    { ok?: boolean }
  >({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleConfirm = () => {
    execute({ id });
  };

  return (
    <ConfirmByNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Shortlink"
      description="This will disable redirects for this code and remove it from Redis."
      expectedName={code}
      confirmPromptLabel="Type the code"
      inputPlaceholder="Enter shortlink code"
      confirmLabel={isExecuting ? "Deleting…" : "Delete Shortlink"}
      confirmVariant="destructive"
      loading={isExecuting}
      onConfirm={handleConfirm}
      preventCloseWhileLoading
    />
  );
}
