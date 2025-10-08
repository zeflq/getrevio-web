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
import { useMerchantItem, useUpdateMerchant } from "../hooks/useMerchantCrud";
import { MerchantFormFields } from "./MerchantFormFields";

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
  const updateMerchant = useUpdateMerchant();

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

  const { reset } = form;

  useEffect(() => {
    if (!merchant) return;
    reset({
      name: merchant.name ?? "",
      email: merchant.email ?? "",
      locale: merchant.locale ?? "",
      plan: merchant.plan ?? "free",
      status: merchant.status ?? "active",
    });
  }, [merchant, reset]);

  const onSubmit = async (data: MerchantUpdateInput) => {
    try {
      await updateMerchant.mutateAsync({ id: merchantId, input: data });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update merchant:", error);
    }
  };

  const resetToLoaded = () => {
    if (!merchant) return;
    reset({
      name: merchant.name ?? "",
      email: merchant.email ?? "",
      locale: merchant.locale ?? "",
      plan: merchant.plan ?? "free",
      status: merchant.status ?? "active",
    });
  };

  const handleSheetChange = (nextOpen: boolean) => {
    if (!nextOpen) resetToLoaded();
    onOpenChange(nextOpen);
  };

  const isBusy = updateMerchant.isPending;
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
