"use client";

import * as React from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RHFInput } from "@/components/form/controls/RHFInput";

import {
  placeStepFormSchema,
  placeStepSubmitSchema,
  type PlaceStepFormInput,
  type PlaceStepData,
} from "../../model/placeStepSchema";
import type { OrganizationStepData } from "../../model/organizationStepSchema";
import { completePlaceStepAction } from "../../server/actions";
import type { ServerErr } from "@/lib/actionUser";

type ShortlinkSummary = {
  id: string;
  code: string;
  targetPlaceId: string;
};

type Props = {
  organizationId?: string;
  defaultValues?: PlaceStepData | null;
  onComplete: (payload: {
    place: PlaceStepData;
    organization: OrganizationStepData;
    shortlink: ShortlinkSummary | null;
  }) => void;
};

function toFormValues(data: PlaceStepData | null | undefined): PlaceStepFormInput {
  return {
    localName: data?.localName ?? "",
    address: data?.address ?? "",
  };
}

export function PlaceStep({ organizationId, defaultValues, onComplete }: Props) {
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const isEditing = Boolean(defaultValues?.id);

  const form = useForm<PlaceStepFormInput>({
    resolver: zodResolver(placeStepFormSchema),
    mode: "onSubmit",
    defaultValues: toFormValues(defaultValues ?? null),
  });

  React.useEffect(() => {
    form.reset(toFormValues(defaultValues ?? null));
  }, [defaultValues, form]);

  const { execute, isExecuting } = useAction(completePlaceStepAction, {
    onSuccess: ({ data }) => {
      setGeneralError(null);
      if (!data?.place || !data?.organization) {
        return;
      }
      form.reset(toFormValues(data.place));
      onComplete({
        place: data.place,
        organization: data.organization,
        shortlink: data.shortlink ?? null,
      });
    },
    onError: ({ error }) => {
      handleServerError(error, form.setError, setGeneralError);
    },
  });

  if (!organizationId) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Complete the organization details before adding your first place.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          const payload = placeStepSubmitSchema.parse({
            ...normalizeFormValues(values),
            organizationId,
            placeId: defaultValues?.id,
          });
          execute(payload);
        })}
        className="space-y-8"
      >
        <div className="space-y-4">
          <h3 className="text-base font-medium">Place details</h3>

          <RHFInput
            name="localName"
            label="Name"
            placeholder="Downtown flagship"
            requiredStar
          />

          <RHFInput
            name="address"
            label="Address"
            placeholder="123 Main St, City"
          />

        </div>

        {generalError ? (
          <p className="text-destructive text-sm">{generalError}</p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? "Saving…" : "Save & continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function normalizeFormValues(values: PlaceStepFormInput) {
  const trim = (value?: string | null) => {
    if (typeof value !== "string") return undefined;
    const next = value.trim();
    return next.length > 0 ? next : undefined;
  };

  return {
    localName: values.localName.trim(),
    address: trim(values.address),
  };
}

function handleServerError(
  error: unknown,
  setFieldError: UseFormReturn<PlaceStepFormInput>["setError"],
  setGeneralError: (message: string | null) => void
) {
  const maybeServerError =
    typeof error === "object" && error !== null && "serverError" in error
      ? (error as { serverError?: ServerErr }).serverError
      : undefined;

  const message =
    maybeServerError?.message ??
    (error instanceof Error ? error.message : "Unable to save your place. Please try again.");

  if (message) {
    console.error(message);
  }

  setGeneralError(
    message && message.trim().length > 0
      ? message
      : "Unable to save your place. Please try again."
  );
}
