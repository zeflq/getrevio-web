"use client";

import * as React from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SheetForm } from "@/components/form/SheetForm";

import {
  lotteryConfigUpdateSchema,
  type LotteryConfigFormValues,
} from "@/features/lotteries/model/lotterySchema";
import { useLotteryItem, useUpdateLottery } from "@/features/lotteries/hooks/useLotteryCrud";
import type { LiteListe } from "@/types/lists";
import { LotteryFormFields } from "./LotteryFormFields";

export interface EditLotterySheetProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
}

export function EditLotterySheet({
  id,
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
}: EditLotterySheetProps) {
  const { data: lottery, isLoading } = useLotteryItem(id);
  const { execute, isExecuting } = useUpdateLottery<LotteryConfigFormValues & { id: string }, { ok?: true }>({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const form = useForm<LotteryConfigFormValues>({
    resolver: zodResolver(lotteryConfigUpdateSchema.omit({ id: true })) as Resolver<LotteryConfigFormValues>,
    mode: "onChange",
    defaultValues: {
      merchantId: merchantId ?? "",
      name: "",
      enabled: "false",
      playLimitPerUser: 1,
      cooldown: "one_day",
      noWinWeight: 0,
      guaranteeWinOnFirstPlay: "false",
      gifts: [],
    },
  });

  const { reset, setValue } = form;

  React.useEffect(() => {
    if (!lottery) return;
      reset({
        merchantId: merchantId ?? lottery.merchantId,
        name: lottery.name,
        enabled: lottery.enabled ? "true" : "false",
        playLimitPerUser: lottery.playLimitPerUser,
        cooldown: lottery.cooldown,
        noWinWeight: lottery.noWinWeight,
      guaranteeWinOnFirstPlay: lottery.guaranteeWinOnFirstPlay ? "true" : "false",
      gifts: lottery.gifts,
    });
  }, [lottery, merchantId, reset]);

  React.useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, { shouldValidate: true, shouldDirty: false });
    }
  }, [merchantId, setValue]);

  const resetForm = () =>
    reset({
      merchantId: merchantId ?? lottery?.merchantId ?? "",
      name: lottery?.name ?? "",
      enabled: lottery?.enabled ? "true" : "false",
      playLimitPerUser: lottery?.playLimitPerUser ?? 1,
      cooldown: lottery?.cooldown ?? "one_day",
      noWinWeight: lottery?.noWinWeight ?? 0,
      guaranteeWinOnFirstPlay: lottery?.guaranteeWinOnFirstPlay ? "true" : "false",
      gifts: lottery?.gifts ?? [],
    });

  const onSubmit = (values: LotteryConfigFormValues) => {
    execute({ id, ...values });
  };

  const handleSheetChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const isBusy = isLoading || isExecuting;
  const isReady = !!lottery && !isLoading;

  return (
    <SheetForm<LotteryConfigFormValues>
      open={open}
      title="Edit Lottery"
      description="Update the lottery configuration."
      methods={form}
      onOpenChange={handleSheetChange}
      onSubmit={onSubmit}
      isBusy={isBusy}
      isReady={isReady}
      onCancel={resetForm}
    >
      <LotteryFormFields
        disabled={isBusy}
        merchantId={merchantId}
        merchantsLite={merchantsLite}
      />
    </SheetForm>
  );
}
