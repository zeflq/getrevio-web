"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogForm } from "@/components/form/DialogForm";
import {
  lotteryConfigCreateSchema,
  type LotteryConfigCreateFormValues,
} from "@/features/lotteries/model/lotterySchema";
import { useCreateLottery } from "@/features/lotteries/hooks/useLotteryCrud";
import type { LiteListe } from "@/types/lists";
import { LotteryFormFields } from "./LotteryFormFields";

export interface CreateLotteryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
}

export function CreateLotteryDialog({
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
}: CreateLotteryDialogProps) {
  const { execute, isExecuting } = useCreateLottery<LotteryConfigCreateFormValues, { ok?: true }>({
    onSuccess: () => {
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const methods = useForm<LotteryConfigCreateFormValues>({
    resolver: zodResolver(lotteryConfigCreateSchema) as Resolver<LotteryConfigCreateFormValues>,
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

  const { reset, setValue } = methods;

  React.useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, { shouldValidate: true, shouldDirty: false });
    }
  }, [merchantId, setValue]);

  const resetForm = () =>
    reset({
      merchantId: merchantId ?? "",
      name: "",
      enabled: "false",
      playLimitPerUser: 1,
      cooldown: "one_day",
      noWinWeight: 0,
      guaranteeWinOnFirstPlay: "false",
      gifts: [],
    });

  const onSubmit = (values: LotteryConfigCreateFormValues) => {
    execute(values);
  };

  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
      <LotteryFormFields
        disabled={isExecuting}
        merchantId={merchantId}
        merchantsLite={merchantsLite}
        showGifts={false}
      />
  );

  return (
    <DialogForm<LotteryConfigCreateFormValues>
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          resetForm();
        }
        onOpenChange(next);
      }}
      title="Create Lottery"
      description="Configure a lottery and its gifts."
      methods={methods}
      onSubmit={onSubmit}
      isBusy={isExecuting}
      isReady={true}
      submitLabel={isExecuting ? "Creating..." : "Create Lottery"}
    />
  );
}
