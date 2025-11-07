// src/features/landings/components/EditLandingSheet.tsx
"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SheetForm } from "@/components/form/SheetForm";
import type { LiteListe } from "@/types/lists";

import {
  landingFormSchema,
  type LandingFormValues,
  type LandingUpdateInput,
  createDefaultLandingContent,
  ensureLandingContentShape,
  mapLandingFormToPayload,
} from "../model/landingSchema";
import { useLandingItem, useUpdateLanding } from "../hooks/useLandingCrud";
import { LandingFormFields } from "./LandingFormFields";

export interface EditLandingSheetProps {
  id: string;
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

export function EditLandingSheet({
  id,
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
}: EditLandingSheetProps) {
  const { data: landing, isLoading } = useLandingItem(id);
  const { execute, isExecuting } = useUpdateLanding<
    { id: string } & LandingUpdateInput,
    { ok?: boolean }
  >({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const form = useForm<LandingFormValues>({
    resolver: zodResolver(landingFormSchema),
    mode: "onChange",
    defaultValues: makeDefaultValues(merchantId),
  });

  const { reset, setValue } = form;

  useEffect(() => {
    if (!landing) return;
    reset({
      settings: {
        merchantId: merchantId ?? landing.merchantId ?? "",
        name: landing.name ?? "",
        status: landing.status ?? "draft",
      },
      content: ensureLandingContentShape(landing.content),
    });
  }, [landing, merchantId, reset]);

  useEffect(() => {
    if (merchantId) {
      setValue("settings.merchantId", merchantId, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [merchantId, setValue]);

  const resetForm = () =>
    reset(
      landing
        ? {
        settings: {
          merchantId: merchantId ?? landing.merchantId ?? "",
          name: landing.name ?? "",
          status: landing.status ?? "draft",
        },
        content: ensureLandingContentShape(landing.content),
          }
        : makeDefaultValues(merchantId)
    );

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

    execute({ id, ...payload });
  };

  const handleSheetChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const isBusy = isLoading || isExecuting;
  const isReady = !!landing && !isLoading;

  return (
    <SheetForm<LandingFormValues>
      open={open}
      title="Edit Landing"
      description="Update landing content."
      methods={form}
      onOpenChange={handleSheetChange}
      onSubmit={onSubmit}
      isBusy={isBusy}
      isReady={isReady}
      onCancel={resetForm}
    >
      <LandingFormFields
        mode="edit"
        disabled={isBusy}
        merchantId={merchantId}
        merchantsLite={merchantsLite}
      />
    </SheetForm>
  );
}
