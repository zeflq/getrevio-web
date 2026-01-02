// src/features/themes/components/EditThemeSheet.tsx
"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SheetForm } from "@/components/form/SheetForm";

import { themeUpdateSchema, type ThemeUpdateInput } from "../model/themeSchema";
import { useThemeItem, useUpdateTheme, useThemePresets } from "../hooks/useThemeCrud";
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

  // Fetch presets from API for fallback
  const { data: presets = [] } = useThemePresets();
  const defaultPreset = presets.find((p) => p.id === "neutral") ?? presets[0];

  const { mutateAsync, isPending } = useUpdateTheme<
    { id: string } & ThemeUpdateInput,
    { ok?: boolean }
  >({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const form = useForm<ThemeUpdateInput>({
    resolver: zodResolver(themeUpdateSchema),
    mode: "onChange",
    defaultValues: {
      id: "",
      merchantId: "",
      name: "",
      meta: defaultPreset
        ? {
            presetKey: defaultPreset.id,
            palette: defaultPreset.palette,
            tokens: defaultPreset.tokens,
          }
        : undefined,
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
      meta:
        theme.meta ??
        (defaultPreset
          ? {
              presetKey: defaultPreset.id,
              palette: defaultPreset.palette,
              tokens: defaultPreset.tokens,
            }
          : undefined),
    });
  }, [theme, reset, defaultPreset]);

  const onSubmit = (data: ThemeUpdateInput) => {
    const merchantId = theme?.merchantId;
    if (!merchantId) {
      return;
    }

    const cleaned: ThemeUpdateInput = {
      ...data,
      meta: data.meta,
    };
    mutateAsync({ id: themeId, merchantId, ...cleaned });
  };

  const isBusy = isPending || isLoading;

  // Reset back to loaded values when closing the sheet
  const handleOpenChange = (next: boolean) => {
    if (!next && theme) {
      reset({
        id: theme.id ?? "",
        merchantId: theme.merchantId ?? "",
        name: theme.name ?? "",
        meta:
          theme.meta ??
          (defaultPreset
            ? {
                presetKey: defaultPreset.id,
                palette: defaultPreset.palette,
                tokens: defaultPreset.tokens,
              }
            : undefined),
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
