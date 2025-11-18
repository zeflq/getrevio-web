"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ThemeFormFields from "@/features/themes/components/ThemeFormFields";
import { themeUpdateSchema, type ThemeUpdateInput } from "@/features/themes/model/themeSchema";
import { useThemeItem, useUpdateTheme } from "@/features/themes/hooks/useThemeCrud";
import type { ThemeListItem } from "@/features/themes/server/queries";
import { buildThemeMeta } from "@/features/themes/lib/themeMeta";

type Props = {
  themeId: string;
  theme?: ThemeListItem | null;
};

export function SingleThemeEditor({ themeId, theme }: Props) {
  const { data: fetchedTheme, isLoading } = useThemeItem(theme ? undefined : themeId);
  const resolvedTheme = theme ?? fetchedTheme;
  const themeForm = useForm<ThemeUpdateInput>({
    resolver: zodResolver(themeUpdateSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      meta: buildThemeMeta(),
    },
  });
  const { reset, handleSubmit, getValues, formState } = themeForm;

  const { execute, isExecuting } = useUpdateTheme<
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
      meta: resolvedTheme.meta ?? buildThemeMeta(),
    });
  }, [resolvedTheme, reset]);

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
    execute({ id: themeId, merchantId, ...cleaned });
  };

  const busy = isExecuting || (!theme && isLoading);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Update your theme. Changes apply everywhere it&apos;s used.
        </p>
      </div>
      <Form {...themeForm}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ThemeFormFields disabled={busy} />
          <div className="flex justify-end">
            <Button type="submit" disabled={busy || !formState.isDirty}>
              {busy ? "Saving…" : "Save theme"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
