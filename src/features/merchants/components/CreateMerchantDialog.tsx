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
  const createMerchant = useCreateMerchant();

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

  const { reset } = methods;

  const resetForm = () =>
    reset({
      name: "",
      email: "",
      locale: "",
      plan: "free",
      status: "active",
    });

  const onSubmit = async (data: MerchantCreateInput) => {
    await createMerchant.mutateAsync(data);
    resetForm();
    onOpenChange(false);
  };

  // Provide children to the DialogForm (rendered inside RHF context)
  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <MerchantFormFields disabled={createMerchant.isPending} showPlanAndStatus />
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
      isBusy={createMerchant.isPending}
      isReady={true}
      submitLabel={createMerchant.isPending ? "Creating..." : "Create Merchant"}
    />
  );
}
