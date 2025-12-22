"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import {
  createLandingFormSchema,
  type LandingFormValues,
  type LandingUpdateInput,
} from "../model/landingSchema";
import { useLandingItem, useUpdateLanding } from "./useLandingCrud";
import { useReadableError } from "@/lib/useReadableError";
import {
  buildLandingPayload,
  createLandingFormDefaults,
  fillLandingFormFromEntity,
} from "../lib/landingForm.mappers";

export function useLandingForm(id: string, isEdit: boolean) {
  const readableError = useReadableError();
  const t = useTranslations("landings.toasts");
  const locale = useLocale();
  const landingQuery = useLandingItem(id);
  const landing = landingQuery.data;
  const form = useForm<LandingFormValues>({
    resolver: zodResolver(createLandingFormSchema(isEdit)),
    mode: "onChange",
    defaultValues: fillLandingFormFromEntity(landing),
  });

  const lastPayloadRef = React.useRef<LandingUpdateInput | null>(null);

  const resetFromEntity = React.useCallback(() => {
    if (!landing) return;
    form.reset(fillLandingFormFromEntity(landing));
  }, [landing, form]);

  React.useEffect(() => {
    if (landing) {
      resetFromEntity();
    }
  }, [landing, resetFromEntity]);

  const { execute, isExecuting } = useUpdateLanding<
    { id: string } & LandingUpdateInput,
    { ok?: boolean }
  >({
    onSuccess: () => {
      toast.success(t("updated"));
      // Reset form with current values to mark as not dirty
      // Using getValues() instead of landing to avoid stale data
      form.reset(form.getValues(), {
        keepValues: true,
        keepDirty: false,
        keepErrors: false,
      });
    },
    onError: (error: unknown) => {
      lastPayloadRef.current = null;
      toast.error(readableError(error, "generic"));
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    try {
      const payload = buildLandingPayload(values, {}, locale);
      lastPayloadRef.current = payload;
      execute({ id, ...payload });
    } catch (error) {
      toast.error(readableError(error, "validation"));
    }
  });

  const onReset = () => {
    if (landing) {
      resetFromEntity();
    } else {
      form.reset(createLandingFormDefaults());
    }
  };

  const isReady = !!landing && !landingQuery.isLoading;

  return {
    landing,
    form,
    isReady,
    isLoading: landingQuery.isLoading,
    error: landingQuery.error,
    isSubmitting: isExecuting,
    onSubmit,
    onReset,
  };
}
