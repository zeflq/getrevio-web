// src/features/merchants/components/EditMerchantSheet.tsx
"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SheetForm } from "@/components/form/SheetForm";

import {
  merchantUpdateSchema,
  type MerchantUpdateInput,
} from "../model/merchantSchema";
import { MerchantFormFields } from "./MerchantFormFields";
import { useMerchantItem, useUpdateMerchant } from "../hooks/useMerchantCrud";

export interface EditMerchantSheetProps {
  merchantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMerchantSheet({
  merchantId,
  open,
  onOpenChange,
}: EditMerchantSheetProps) {
  const { data: merchant, isLoading } = useMerchantItem(merchantId);

  const { execute, isExecuting } = useUpdateMerchant<
    { id: string } & MerchantUpdateInput,
    { ok?: boolean }
  >({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const form = useForm<MerchantUpdateInput>({
    resolver: zodResolver(merchantUpdateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      locale: "",
      plan: "free",
      status: "active",
    },
  });

  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (!merchant) return;
    reset({
      name: merchant.name ?? "",
      email: merchant.email ?? "",
      locale: (merchant as any).locale ?? "",
      plan: (merchant as any).plan ?? "free",
      status: (merchant as any).status ?? "active",
    });
  }, [merchant, reset]);

  const onSubmit = (data: MerchantUpdateInput) => {
    // Server action expects flat input with id at root
    execute({ id: merchantId, ...data });
  };

  const resetToLoaded = () => {
    if (!merchant) return;
    reset({
      name: merchant.name ?? "",
      email: merchant.email ?? "",
      locale: (merchant as any).locale ?? "",
      plan: (merchant as any).plan ?? "free",
      status: (merchant as any).status ?? "active",
    });
  };

  const handleSheetChange = (nextOpen: boolean) => {
    if (!nextOpen) resetToLoaded();
    onOpenChange(nextOpen);
  };

  const isBusy = isExecuting;
  const isReady = !!merchant && !isLoading;

  return (
    <SheetForm<MerchantUpdateInput>
      open={open}
      title="Edit Merchant"
      description="Update merchant information. Changes will be saved immediately."
      methods={form}
      onOpenChange={handleSheetChange}
      onSubmit={onSubmit}
      isBusy={isBusy}
      isReady={isReady}
      onCancel={resetToLoaded}
    >
      <MerchantFormFields disabled={isBusy} showPlanAndStatus />
    </SheetForm>
  );
}
