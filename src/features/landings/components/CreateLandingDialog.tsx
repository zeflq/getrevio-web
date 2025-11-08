// src/features/landings/components/CreateLandingDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "@/i18n/navigation";
import { DialogForm } from "@/components/form/DialogForm";
import type { LiteListe } from "@/types/lists";

import {
  landingCreateFormSchema,
  type LandingCreateFormValues,
  type LandingCreateInput,
  createLandingCreateFormDefaults,
  type LandingBelongsTo,
} from "../model/landingSchema";
import { useCreateLanding } from "../hooks/useLandingCrud";
import { LandingFormFields } from "./LandingFormFields";
import { buildLandingPayload } from "../lib/landingForm.mappers";
import { createDefaultBlocksForContext } from "../lib/landingContent.presets";

export interface CreateLandingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
  initialBelongsTo?: LandingBelongsTo;
}

export function CreateLandingDialog({
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
  initialBelongsTo,
}: CreateLandingDialogProps) {
  const router = useRouter();
  const defaultValues = React.useMemo(
    () => createLandingCreateFormDefaults({ merchantId, belongsTo: initialBelongsTo }),
    [merchantId, initialBelongsTo]
  );

  const { execute, isExecuting } = useCreateLanding<LandingCreateInput, { id: string }>({
    onSuccess: ({ data }) => {
      resetForm();
      onOpenChange(false);
      onSuccess?.();
      router.push(`/admin/landings/${data.id}/edit`);
    },
  });

  const methods = useForm<LandingCreateFormValues>({
    resolver: zodResolver(landingCreateFormSchema),
    mode: "onSubmit",
    defaultValues,
  });

  const { reset, setValue } = methods;

  React.useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [defaultValues, open, reset]);

  React.useEffect(() => {
    if (merchantId) {
      setValue("settings.merchantId", merchantId, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [merchantId, setValue]);

  const resetForm = () =>
    reset(createLandingCreateFormDefaults({ merchantId, belongsTo: initialBelongsTo }));

  const onSubmit = (data: LandingCreateFormValues) => {
    const payload = buildLandingPayload(data);
    if (initialBelongsTo?.type === "campaign") {
      payload.content.blocks = createDefaultBlocksForContext({ context: "campaign" });
    }
    execute(payload);
  };

  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <LandingFormFields
      disabled={isExecuting}
      merchantId={merchantId}
      merchantsLite={merchantsLite}
    />
  );

  return (
    <DialogForm<LandingCreateFormValues>
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
      title="Create Landing"
      description="Attach a landing to one campaign or place. You can customize the content after creation."
      methods={methods}
      onSubmit={onSubmit}
      isBusy={isExecuting}
      isReady={true}
      submitLabel={isExecuting ? "Creating..." : "Create Landing"}
    />
  );
}
