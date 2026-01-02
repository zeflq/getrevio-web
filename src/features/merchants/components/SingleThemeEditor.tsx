"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ThemeFormFields from "@/features/themes/components/ThemeFormFields";
import { themeUpdateSchema, type ThemeUpdateInput } from "@/features/themes/model/themeSchema";
import { useThemeItem, useUpdateTheme, useThemePresets } from "@/features/themes/hooks/useThemeCrud";
import type { Theme } from "@/types/domain";

type Props = {
  themeId: string;
  theme?: Theme | null;
};

export function SingleThemeEditor({ themeId, theme }: Props) {
  const { data: fetchedTheme, isLoading } = useThemeItem(theme ? undefined : themeId);
  const resolvedTheme = theme ?? fetchedTheme;

  // Fetch presets from API for fallback
  const { data: presets = [] } = useThemePresets();
  const defaultPreset = presets.find((p) => p.id === "neutral") ?? presets[0];

  const themeForm = useForm<ThemeUpdateInput>({
    resolver: zodResolver(themeUpdateSchema),
    mode: "onSubmit",
    defaultValues: {
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
  const { reset, handleSubmit, getValues, formState } = themeForm;

  const { mutateAsync, isPending } = useUpdateTheme<
    { id: string } & ThemeUpdateInput,
    { ok?: boolean }
  >({
    onSuccess: () => {
      toast.success("Theme updated");
      reset(getValues());
    },
  });

  useEffect(() => {
    if (!resolvedTheme) return;
    reset({
      name: resolvedTheme.name ?? "",
      meta:
        resolvedTheme.meta ??
        (defaultPreset
          ? {
              presetKey: defaultPreset.id,
              palette: defaultPreset.palette,
              tokens: defaultPreset.tokens,
            }
          : undefined),
    });
  }, [resolvedTheme, reset, defaultPreset]);

  const onSubmit = (values: ThemeUpdateInput) => {
    const merchantId = resolvedTheme?.merchantId;
    if (!merchantId) {
      toast.error("Unable to determine merchant for this theme.");
      return;
    }

    const cleaned: ThemeUpdateInput = {
      ...values,
      meta: values.meta,
    };
    mutateAsync({ id: themeId, merchantId, ...cleaned });
  };

  const busy = isPending || (!theme && isLoading);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Update your theme. Changes apply everywhere it&apos;s used.</CardDescription>
      </CardHeader>
      <Form {...themeForm}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-4">
            <ThemeFormFields disabled={busy} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={busy || !formState.isDirty}>
              {busy ? "Saving…" : "Save theme"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
