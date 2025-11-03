"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMerchantAction } from "../server/actions";

const NO_THEME_VALUE = "__MERCHANT_NO_THEME__";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  defaultThemeId: z.string().optional(),
});

type MerchantSettingsFormValues = z.infer<typeof formSchema>;

type Props = {
  merchantId: string;
  defaultName: string;
  defaultEmail?: string | null;
  defaultThemeId?: string | null;
  themes: { value: string; label: string }[];
};

export function MerchantSettingsForm({
  merchantId,
  defaultName,
  defaultEmail,
  defaultThemeId,
  themes,
}: Props) {
  const themeCount = themes.length;
  const hasSingleTheme = themeCount === 1;
  const hasMultipleThemes = themeCount > 1;
  const singleThemeId = hasSingleTheme ? themes[0].value : undefined;

  const form = useForm<MerchantSettingsFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: defaultName,
      defaultThemeId: defaultThemeId ?? singleThemeId ?? undefined,
    },
  });

  const { execute, isExecuting } = useAction(updateMerchantAction, {
    onSuccess: ({ data }) => {
      const nextName =
        (data && typeof data === "object" && data !== null && "name" in data
          ? ((data as { name?: string | null }).name ?? "")
          : form.getValues("name")) || "";
      const nextDefaultTheme =
        data && typeof data === "object" && data !== null && "defaultThemeId" in data
          ? ((data as { defaultThemeId?: string | null }).defaultThemeId ?? undefined)
          : hasMultipleThemes
          ? form.getValues("defaultThemeId") ?? undefined
          : hasSingleTheme
          ? themes[0].value
          : undefined;

      form.reset({
        name: nextName,
        defaultThemeId: nextDefaultTheme ?? undefined,
      });
      toast.success("Merchant details updated");
    },
    onError: ({ error }) => {
      const message =
        error instanceof Error ? error.message : "Unable to save changes. Please try again.";
      toast.error(message);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merchant</CardTitle>
        <CardDescription>Update your merchant profile and defaults.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            const normalizedName = values.name.trim();
            const resolvedThemeId = hasMultipleThemes
              ? values.defaultThemeId
              : hasSingleTheme
              ? singleThemeId
              : undefined;
            execute({
              id: merchantId,
              name: normalizedName,
              defaultThemeId: resolvedThemeId ?? undefined,
            });
          })}
        >
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Revio Hospitality"
                      autoComplete="off"
                      data-lpignore="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasMultipleThemes ? (
              <FormField
                control={form.control}
                name="defaultThemeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default theme</FormLabel>
                    <Select
                      value={field.value ?? NO_THEME_VALUE}
                      onValueChange={(value) =>
                        field.onChange(value === NO_THEME_VALUE ? undefined : value)
                      }
                      disabled={isExecuting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_THEME_VALUE}>Use merchant default</SelectItem>
                        {themes.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            {theme.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {!hasMultipleThemes && !hasSingleTheme ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t created any themes yet. Create one to customize your brand.
              </p>
            ) : null}

            <div className="grid gap-2">
              <FormLabel>Email</FormLabel>
              <Input type="email" value={defaultEmail ?? ""} disabled readOnly />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="submit" disabled={isExecuting || !form.formState.isDirty}>
              {isExecuting ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
