// src/features/landings/components/CreateLandingDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { DialogForm } from "@/components/form/DialogForm";
import type { LiteListe } from "@/types/lists";

import {
  landingFormSchema,
  type LandingFormValues,
  type LandingCreateInput,
  type LandingBelongsTo,
} from "../model/landingSchema";
import { useCreateLanding } from "../hooks/useLandingCrud";
import { LandingFormFields } from "./LandingFormFields";
import { buildLandingPayload, createLandingFormDefaults } from "../lib/landingForm.mappers";
import { useLandingSlugCheck } from "../hooks/useLandingSlugCheck";

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
  const tEditor = useTranslations("landings.editor");
  const tForm = useTranslations("landings.form");
  const router = useRouter();
  const defaultValues = React.useMemo(
    () => createLandingFormDefaults({ merchantId, belongsTo: initialBelongsTo }),
    [merchantId, initialBelongsTo]
  );

  const { execute, isExecuting } = useCreateLanding<LandingCreateInput, { id: string }>({
    onSuccess: ({ data }) => {
      resetForm();
      onOpenChange(false);
      onSuccess?.();
      router.push(`${redirectBasePath}/${data.id}/edit`);
    },
  });

  const methods = useForm<LandingFormValues>({
    resolver: zodResolver(landingFormSchema),
    mode: "onSubmit",
    defaultValues,
  });

  const { reset, setValue, watch } = methods;
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
    const payload = buildLandingPayload(data, { seedTemplateContent: true }, tEditor);
    execute(payload);
  };

  const slugValue = watch("settings.slug");
  const [debouncedSlug, setDebouncedSlug] = React.useState("");
  React.useEffect(() => {
    const handle = setTimeout(() => setDebouncedSlug(slugValue ?? ""), 300);
    return () => clearTimeout(handle);
  }, [slugValue]);

  const { data: slugCheck, isFetching: slugChecking } = useLandingSlugCheck(
    debouncedSlug || undefined
  );
  const slugExists = !!slugCheck?.exists;

  const slugSuffix = slugChecking ? (
    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" aria-hidden="true" />
  ) : debouncedSlug ? (
    slugExists ? (
      <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
    )
  ) : null;

  const slugDescription = debouncedSlug
    ? slugExists
      ? tForm("slugTaken")
      : tForm("slugAvailable")
    : undefined;

  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <LandingFormFields
      isEdit={false}
      disabled={isExecuting}
      merchantId={merchantId}
      merchantsLite={merchantsLite}
      slugSuffix={slugSuffix}
      slugDescription={slugDescription}
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
      isBusy={isExecuting}
      isReady={true}
      submitLabel={isExecuting ? t("submitCreating") : t("submitLabel")}
    />
  );
}
