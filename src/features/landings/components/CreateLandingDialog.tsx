// src/features/landings/components/CreateLandingDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { DialogForm } from "@/components/form/DialogForm";
import type { LiteListe } from "@/types/lists";

import {
  landingFormSchema,
  type LandingFormValues,
  type LandingBelongsTo,
} from "../model/landingSchema";
import { useCreateLanding } from "../hooks/useLandingCrud";
import { LandingFormFields } from "./LandingFormFields";
import { buildLandingPayload, createLandingFormDefaults } from "../lib/landingForm.mappers";

export interface CreateLandingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
  initialBelongsTo?: LandingBelongsTo;
  redirectBasePath?: string;
}

export function CreateLandingDialog({
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
  initialBelongsTo,
  redirectBasePath = "/admin/landings",
}: CreateLandingDialogProps) {
  const t = useTranslations("landings.createDialog");
  const locale = useLocale();
  const router = useRouter();
  const defaultValues = React.useMemo(
    () => createLandingFormDefaults({ merchantId, belongsTo: initialBelongsTo }),
    [merchantId, initialBelongsTo]
  );

  const { mutateAsync, isPending } = useCreateLanding({
    onSuccess: (data) => {
      resetForm();
      onOpenChange(false);
      onSuccess?.();
      if (data?.id) {
        router.push(`${redirectBasePath}/${data.id}/edit`);
      }
    },
  });

  const methods = useForm<LandingFormValues>({
    resolver: zodResolver(landingFormSchema),
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
    reset(createLandingFormDefaults({ merchantId, belongsTo: initialBelongsTo }));

  const onSubmit = (data: LandingFormValues) => {
    const payload = buildLandingPayload(data, { seedTemplateContent: true }, locale);
    mutateAsync(payload);
  };

  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <LandingFormFields
      isEdit={false}
      disabled={isPending}
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
      title={t("title")}
      description={t("description")}
      methods={methods}
      onSubmit={onSubmit}
      isBusy={isPending}
      isReady={true}
      submitLabel={isPending ? t("submitCreating") : t("submitLabel")}
    />
  );
}
