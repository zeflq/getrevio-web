"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SheetForm } from "@/components/form/SheetForm";
import type { LiteListe } from "@/types/lists";

import { ShortlinkFormFields } from "./ShortlinkFormFields";
import { useShortlinkItem, useUpdateShortlink } from "../hooks/useShortlinkCrud";
import {
  shortlinkFormSchema,
  type ShortlinkFormValues,
  type ShortlinkUpdateInput,
} from "../model/shortlinkSchema";
import {
  buildUpdateShortlinkPayload,
  createInitialShortlinkValues,
  shortlinkToFormValues,
} from "../lib/transformers";
import { toast } from "sonner";
import { useReadableError } from "@/lib/useReadableError";

type EditShortlinkSheetProps = {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
};

export function EditShortlinkSheet({
  id,
  open,
  onOpenChange,
  merchantsLite = [],
  onSuccess,
}: EditShortlinkSheetProps) {
  const shortlinkQuery = useShortlinkItem(open ? id : undefined);
  const readableError = useReadableError();
  const { execute, isExecuting } = useUpdateShortlink<
    { id: string } & ShortlinkUpdateInput,
    { ok?: boolean }
  >({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (e) => {
      toast.error(readableError(e, "generic"));
    },
  });

  const methods = useForm<ShortlinkFormValues>({
    resolver: zodResolver(shortlinkFormSchema),
    mode: "onSubmit",
    defaultValues: createInitialShortlinkValues(),
  });

  const { reset } = methods;
  React.useEffect(() => {
    if (shortlinkQuery.data) {
      reset(shortlinkToFormValues(shortlinkQuery.data));
    }
  }, [shortlinkQuery.data, reset]);

  const handleSubmit = (values: ShortlinkFormValues) => {
    const payload = buildUpdateShortlinkPayload(values);
    execute({ id, ...payload });
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

  const isBusy = isExecuting || shortlinkQuery.isLoading;
  const isReady = !!shortlinkQuery.data && !shortlinkQuery.isLoading;

  return (
    <SheetForm<ShortlinkFormValues>
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
