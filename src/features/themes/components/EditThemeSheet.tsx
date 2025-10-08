// src/features/themes/components/EditThemeSheet.tsx
"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SheetForm } from "@/components/form/SheetForm";

import { themeUpdateSchema, type ThemeUpdateInput } from "../model/themeSchema";
import { useThemeItem, useUpdateTheme } from "../hooks/useThemeCrud";
import ThemeFormFields from "./ThemeFormFields";

export interface EditThemeSheetProps {
  themeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditThemeSheet({
  themeId,
  open,
  onOpenChange,
  onSuccess,
}: EditThemeSheetProps) {
  const { data: theme, isLoading } = useThemeItem(themeId);
  const updateTheme = useUpdateTheme();

  const form = useForm<ThemeUpdateInput>({
    resolver: zodResolver(themeUpdateSchema),
    mode: "onChange",
    defaultValues: {
      id: "",
      merchantId: "",
      name: "",
      logoUrl: "",
      brandColor: "",
      accentColor: "",
      textColor: "",
      meta: {}, // keep controlled
    },
  });

  const { reset } = form;

  // Hydrate form when theme loads/changes
  useEffect(() => {
    if (!theme) return;
    reset({
      id: theme.id ?? "",
      merchantId: theme.merchantId ?? "",
      name: theme.name ?? "",
      logoUrl: theme.logoUrl ?? "",
      brandColor: theme.brandColor ?? "",
      accentColor: theme.accentColor ?? "",
      textColor: theme.textColor ?? "",
      meta: theme.meta ?? {},
    });
  }, [theme, reset]);

  const onSubmit = async (data: ThemeUpdateInput) => {
    const cleaned: ThemeUpdateInput = {
      ...data,
      logoUrl: data.logoUrl || undefined,
      brandColor: data.brandColor || undefined,
      accentColor: data.accentColor || undefined,
      textColor: data.textColor || undefined,
      meta: data.meta && Object.keys(data.meta).length > 0 ? data.meta : undefined,
    };
    await updateTheme.mutateAsync({ id: themeId, input: cleaned } as any);
    onSuccess?.();
    onOpenChange(false);
  };

  const isBusy = updateTheme.isPending || isLoading;

  // Reset back to loaded values when closing the sheet
  const handleOpenChange = (next: boolean) => {
    if (!next && theme) {
      reset({
        id: theme.id ?? "",
        merchantId: theme.merchantId ?? "",
        name: theme.name ?? "",
        logoUrl: theme.logoUrl ?? "",
        brandColor: theme.brandColor ?? "",
        accentColor: theme.accentColor ?? "",
        textColor: theme.textColor ?? "",
        meta: theme.meta ?? {},
      });
    }
    onOpenChange(next);
  };

  return (
    <SheetForm<ThemeUpdateInput>
      open={open}
      title="Edit Theme"
      description="Update theme details."
      methods={form}
      onOpenChange={handleOpenChange}
      onSubmit={onSubmit}
      isBusy={isBusy}
      isReady={!isLoading}
    >
      <ThemeFormFields disabled={isBusy} />
    </SheetForm>
  );
}
