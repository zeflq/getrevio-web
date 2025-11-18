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
import { updateMerchantAction } from "../server/actions";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

type MerchantSettingsFormValues = z.infer<typeof formSchema>;

type Props = {
  merchantId: string;
  defaultName: string;
  defaultEmail?: string | null;
  themes: { value: string; label: string }[];
};

export function MerchantSettingsForm({
  merchantId,
  defaultName,
  defaultEmail,
  themes,
}: Props) {
  const form = useForm<MerchantSettingsFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: defaultName,
    },
  });

  const { execute, isExecuting } = useAction(updateMerchantAction, {
    onSuccess: () => {
      form.reset({ name: form.getValues("name") });
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
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile and defaults.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            const normalizedName = values.name.trim();
            execute({
              id: merchantId,
              name: normalizedName,
            });
          })}
        >
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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

            {!themes.length ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t created any themes yet. Create one to customize your brand.
              </p>
            ) : null}

            <div className="grid gap-2">
              <FormLabel>Email</FormLabel>
              <Input type="email" value={defaultEmail ?? ""} disabled readOnly />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isExecuting || !form.formState.isDirty}>
                  {isExecuting ? "Saving…" : "Save changes"}
                </Button>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
