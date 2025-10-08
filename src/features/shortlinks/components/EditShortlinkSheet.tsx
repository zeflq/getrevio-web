"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SheetForm } from "@/components/form/SheetForm";
import type { MerchantLite } from "@/features/merchants";

import { ShortlinkFormFields } from "./ShortlinkFormFields";
import { useShortlinkItem, useUpdateShortlink } from "../hooks/useShortlinkCrud";
import { shortlinkCreateSchema, type ShortlinkCreateInput } from "../model/shortlinkSchema";
import {
  buildUpdateShortlinkPayload,
  createInitialShortlinkValues,
  shortlinkToFormValues,
} from "../lib/transformers";

type EditShortlinkSheetProps = {
  code: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantsLite?: MerchantLite[];
  onSuccess?: () => void;
};

export function EditShortlinkSheet({
  code,
  open,
  onOpenChange,
  merchantsLite = [],
  onSuccess,
}: EditShortlinkSheetProps) {
  const shortlinkQuery = useShortlinkItem(open ? code : undefined);
  const updateShortlink = useUpdateShortlink();

  const methods = useForm<ShortlinkCreateInput>({
    resolver: zodResolver(shortlinkCreateSchema),
    mode: "onChange",
    defaultValues: createInitialShortlinkValues(),
  });

  const { reset } = methods;

  React.useEffect(() => {
    if (shortlinkQuery.data) {
      reset(shortlinkToFormValues(shortlinkQuery.data));
    }
  }, [shortlinkQuery.data, reset]);

  const handleSubmit = async (values: ShortlinkCreateInput) => {
    const payload = buildUpdateShortlinkPayload(values);
    await updateShortlink.mutateAsync({ id: code, input: payload });
    onSuccess?.();
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset(
        shortlinkQuery.data
          ? shortlinkToFormValues(shortlinkQuery.data)
          : createInitialShortlinkValues(),
      );
    }
    onOpenChange(next);
  };

  const isBusy = updateShortlink.isPending;
  const isReady = !!shortlinkQuery.data;

  return (
    <SheetForm<ShortlinkCreateInput>
      open={open}
      title="Edit Shortlink"
      description="Update shortlink targeting, status, or metadata."
      methods={methods}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isBusy={isBusy}
      isReady={isReady}
    >
      <ShortlinkFormFields
        mode="edit"
        disabled={isBusy || shortlinkQuery.isLoading}
        merchantsLite={merchantsLite}
      />
    </SheetForm>
  );
}
