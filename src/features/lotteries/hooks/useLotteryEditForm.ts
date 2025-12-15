"use client";

import * as React from "react";
import { useEditPageForm } from "@/hooks/useEditPageForm";
import { useReadableError } from "@/lib/useReadableError";
import {
  lotteryConfigUpdateSchema,
  type LotteryConfigFormValues,
} from "../model/lotterySchema";
import { useLotteryItem, useUpdateLottery } from "./useLotteryCrud";

/**
 * Form logic for lottery edit pages.
 * Uses the generic useEditPageForm hook with lottery-specific configuration.
 */
export function useLotteryEditForm(id: string, merchantId?: string) {
  const readableError = useReadableError();

  const editForm = useEditPageForm({
    id,
    useItemQuery: useLotteryItem,
    useUpdateMutation: useUpdateLottery,
    schema: lotteryConfigUpdateSchema.omit({ id: true }),

    entityToFormValues: (lottery) => ({
      merchantId: merchantId ?? lottery?.merchantId ?? "",
      name: lottery?.name ?? "",
      enabled: lottery?.enabled ? "true" : "false",
      playLimitPerUser: lottery?.playLimitPerUser ?? 1,
      cooldown: lottery?.cooldown ?? "one_day",
      noWinWeight: lottery?.noWinWeight ?? 0,
      guaranteeWinOnFirstPlay: lottery?.guaranteeWinOnFirstPlay ? "true" : "false",
      gifts: lottery?.gifts ?? [],
    }),

    formValuesToPayload: (values) => values,

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

    successMessage: "Lottery updated successfully",
    errorMessage: "Failed to update lottery",
    readableError,
  });

  // Override merchantId if locked
  React.useEffect(() => {
    if (merchantId && editForm.entity) {
      editForm.form.setValue("merchantId", merchantId, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [merchantId, editForm.entity, editForm.form]);

  return {
    ...editForm,
    lottery: editForm.entity,
  };
}
