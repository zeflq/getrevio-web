// src/features/merchants/components/CreateMerchantDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogForm } from "@/components/form/DialogForm";
import { MerchantFormFields } from "./MerchantFormFields";

import {
  merchantCreateSchema,
  type MerchantCreateInput,
} from "../model/merchantSchema";
import { useCreateMerchant } from "../hooks/useMerchantCrud";

export interface CreateMerchantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMerchantDialog({
  open,
  onOpenChange,
}: CreateMerchantDialogProps) {
  // Wire the success handler here so we can close/reset after the action completes.
  const { mutateAsync, isPending } = useCreateMerchant<MerchantCreateInput, { id?: string }>({
    onSuccess: () => {
      resetForm();
      onOpenChange(false);
    },
  });

  const methods = useForm<MerchantCreateInput>({
    resolver: zodResolver(merchantCreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      locale: "",
      plan: "free",
      status: "active",
    },
  });

  const { reset, handleSubmit } = methods;

  const resetForm = () =>
    reset({
      name: "",
      email: "",
      locale: "",
      plan: "free",
      status: "active",
    });

  const onSubmit = (data: MerchantCreateInput) => {
    mutateAsync(data);
  };

  // Provide children to the DialogForm (rendered inside RHF context)
  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <MerchantFormFields disabled={isPending} showPlanAndStatus />
  );

  return (
    <DialogForm<MerchantCreateInput>
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
      title="Create Merchant"
      description="Add a new merchant to the system. Fill in the required information below."
      methods={methods}
      onSubmit={onSubmit}
      isBusy={isPending}
      isReady={true}
      submitLabel={isPending ? "Creating..." : "Create Merchant"}
    />
  );
}
