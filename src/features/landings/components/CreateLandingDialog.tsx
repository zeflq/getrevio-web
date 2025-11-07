// src/features/landings/components/CreateLandingDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogForm } from "@/components/form/DialogForm";
import type { LiteListe } from "@/types/lists";

import {
  landingFormSchema,
  type LandingFormValues,
  type LandingCreateInput,
  createDefaultLandingContent,
  mapLandingFormToPayload,
} from "../model/landingSchema";
import { useCreateLanding } from "../hooks/useLandingCrud";
import { LandingFormFields } from "./LandingFormFields";

export interface CreateLandingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
}

const makeDefaultValues = (merchantId?: string): LandingFormValues => ({
  settings: {
    merchantId: merchantId ?? "",
    name: "",
    status: "draft",
  },
  content: createDefaultLandingContent(),
});

export function CreateLandingDialog({
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
}: CreateLandingDialogProps) {
  const { execute, isExecuting } = useCreateLanding<LandingCreateInput, { ok?: boolean }>({
    onSuccess: () => {
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const methods = useForm<LandingFormValues>({
    resolver: zodResolver(landingFormSchema),
    mode: "onChange",
    defaultValues: makeDefaultValues(merchantId),
  });

  const { reset, setValue } = methods;

  React.useEffect(() => {
    if (merchantId) {
      setValue("settings.merchantId", merchantId, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [merchantId, setValue]);

  const resetForm = () => reset(makeDefaultValues(merchantId));

  const onSubmit = (data: LandingFormValues) => {
    const curatedCtas = (data.content.blocks[0]?.ctas ?? [])
      .filter((cta) => (cta.label?.trim() ?? "") && (cta.url?.trim() ?? ""))
      .map((cta) => ({
        ...cta,
        label: cta.label?.trim() ?? "",
        url: cta.url?.trim() ?? "",
      }));

    const normalizedContent = {
      ...data.content,
      blocks: [
        {
          ...data.content.blocks[0],
          ctas: curatedCtas.length > 0 ? curatedCtas : undefined,
        },
      ],
    } as LandingFormValues["content"];

    const payload = mapLandingFormToPayload({
      ...data,
      content: normalizedContent,
    });

    execute(payload);
  };

  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <LandingFormFields
      mode="create"
      disabled={isExecuting}
      merchantId={merchantId}
      merchantsLite={merchantsLite}
    />
  );

  return (
    <DialogForm<LandingFormValues>
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
      title="Create Landing"
      description="Define landing content available to campaigns and places."
      methods={methods}
      onSubmit={onSubmit}
      isBusy={isExecuting}
      isReady={true}
      submitLabel={isExecuting ? "Creating..." : "Create Landing"}
    />
  );
}
