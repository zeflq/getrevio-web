"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  createLandingFormDefaults,
  landingFormSchema,
  type LandingFormValues,
  type LandingUpdateInput,
  type LandingCreateInput,
} from "../model/landingSchema";
import { useLandingItem, useUpdateLanding } from "./useLandingCrud";
import { useReadableError } from "@/lib/useReadableError";
import {
  buildLandingPayload,
  fillLandingFormFromEntity,
  fillLandingFormFromPayload,
} from "../lib/landingForm.mappers";

export function useLandingForm(id: string) {
  const readableError = useReadableError();
  const t = useTranslations("landings.toasts");
  const landingQuery = useLandingItem(id);
  const landing = landingQuery.data;

  const form = useForm<LandingFormValues>({
    resolver: zodResolver(landingFormSchema),
    mode: "onChange",
    defaultValues: createLandingFormDefaults(),
  });

  const lastPayloadRef = React.useRef<LandingCreateInput | null>(null);

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
      if (lastPayloadRef.current) {
        form.reset(fillLandingFormFromPayload(lastPayloadRef.current));
        lastPayloadRef.current = null;
      } else if (landing) {
        resetFromEntity();
      }
    },
    onError: ({ error }) => {
      lastPayloadRef.current = null;
      toast.error(readableError(error, "generic"));
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    try {
      const payload = buildLandingPayload(values);
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
