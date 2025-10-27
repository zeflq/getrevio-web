"use client";

import * as React from "react";
import { useAction } from "next-safe-action/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RHFInput } from "@/components/form/controls/RHFInput";

import {
  organizationStepFormSchema,
  organizationStepSubmitSchema,
  type OrganizationStepFormInput,
  type OrganizationStepData,
} from "../../model/organizationStepSchema";
import { completeOrganizationStepAction } from "../../server/actions";
import { ServerErr } from "@/lib/actionUser";

type Props = {
  defaultValues?: OrganizationStepData;
  organizationId?: string;
  onComplete: (payload: { organization: OrganizationStepData }) => void;
};

function toFormValues(data: OrganizationStepData | undefined | null): OrganizationStepFormInput {
  if (!data) {
    return {
      name: "",
      email: "",
    };
  }

  return {
    name: data.name,
    email: data.email ?? "",
  };
}

export function OrganizationStep({ defaultValues, organizationId, onComplete }: Props) {
  const initialData = defaultValues ?? null;
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const form = useForm<OrganizationStepFormInput>({
    resolver: zodResolver(organizationStepFormSchema),
    mode: "onSubmit",
    defaultValues: toFormValues(initialData),
  });

  const { execute, isExecuting } = useAction(completeOrganizationStepAction, {
    onSuccess: ({ data }) => {
      setGeneralError(null);
      onComplete({ organization: data.organization });
    },
    onError: ({ error }) => {
      const maybeServerError =
        typeof error === "object" && error !== null && "serverError" in error
          ? (error as { serverError?: unknown }).serverError
          : undefined;

      const code =
        typeof maybeServerError === "object" && maybeServerError !== null && "code" in maybeServerError
          ? (maybeServerError as { code?: number }).code
          : undefined;

      const rawMessage =
        typeof maybeServerError === "object" && maybeServerError !== null && "message" in maybeServerError
          ? String((maybeServerError as { message?: string }).message ?? "")
          : error instanceof Error
          ? error.message
          : String(error ?? "");

      const normalizedMessage = rawMessage.toUpperCase();

      if (code === 409 || normalizedMessage.includes("EMAIL_ALREADY_USED")) {
        form.setError("email", {
          type: "server",
          message: "This email is already associated with another organization.",
        });
        return;
      }

      setGeneralError("Unable to save organization. Please try again.");
      if (rawMessage) {
        console.error(rawMessage);
      }
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          const payload = organizationStepSubmitSchema.parse({
            ...values,
            organizationId,
          });
          execute(payload);
        })}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <RHFInput
            name="name"
            label="Organization name"
            placeholder="Acme Hospitality"
            requiredStar
          />

          <RHFInput
            name="email"
            label="Contact email (optional)"
            type="email"
            placeholder="team@acme.com"
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
