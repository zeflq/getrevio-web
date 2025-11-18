"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogForm } from "@/components/form/DialogForm";
import { RHFCombobox } from "@/components/form/controls";
import ThemeFormFields from "./ThemeFormFields";

import { themeCreateSchema, type ThemeCreateInput } from "../model/themeSchema";
import { useCreateTheme } from "../hooks/useThemeCrud";
import type { LiteListe } from "@/types/lists";
import { buildThemeMeta } from "../lib/themeMeta";

export interface CreateThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId?: string;                // if provided, hide merchant picker
  merchantsLite?: LiteListe[];
  onSuccess?: () => void;
}

export function CreateThemeDialog({
  open,
  onOpenChange,
  merchantId,
  merchantsLite = [],
  onSuccess,
}: CreateThemeDialogProps) {
  const { execute, isExecuting } = useCreateTheme<ThemeCreateInput, { id?: string }>({
    onSuccess: () => {
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const methods = useForm<ThemeCreateInput>({
    resolver: zodResolver(themeCreateSchema),
    mode: "onChange",
    defaultValues: {
      merchantId: merchantId ?? "",
      name: "",
      meta: buildThemeMeta(),
    },
  });

  const { reset, setValue } = methods;

  React.useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [merchantId, setValue]);

  const resetForm = () =>
    reset({
      merchantId: merchantId ?? "",
      name: "",
      meta: buildThemeMeta(),
    });

  const onSubmit = (d: ThemeCreateInput) => {
    const cleaned: ThemeCreateInput = {
      ...d,
      meta: d.meta,
    };

    execute(cleaned);
  };

  // Provide the inner fields to DialogForm inside RHF context
  type MethodsWithSlot = typeof methods & { _slot?: React.ReactNode };
  (methods as MethodsWithSlot)._slot = (
    <>
      {!merchantId && (
        <RHFCombobox<LiteListe>
          name="merchantId"
          label="Merchant"
          options={merchantsLite}
          getOptionValue={(m) => m.value}
          getOptionLabel={(m) => m.label}
          placeholder="Select merchant"
          searchPlaceholder="Search merchants…"
          requiredStar
          disabled={isExecuting}
        />
      )}
      <ThemeFormFields disabled={isExecuting} />
    </>
  );

  return (
    <DialogForm<ThemeCreateInput>
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
      title="Create Theme"
      description="Create a new theme for a merchant."
      methods={methods}
      onSubmit={onSubmit}
      isBusy={isExecuting}
      isReady
      submitLabel={isExecuting ? "Creating..." : "Create Theme"}
      className="sm:max-w-[560px]"
    />
  );
}
