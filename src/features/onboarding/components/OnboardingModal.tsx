"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompleteOnboarding } from "../hooks/useCompleteOnboarding";
import { CheckCircle2 } from "lucide-react";

const onboardingSchema = z.object({
  organizationName: z
    .string()
    .min(1, "Organization name is required")
    .max(255, "Organization name must be less than 255 characters"),
  organizationEmail: z
    .string()
    .email("Invalid email format")
    .or(z.literal(""))
    .optional(),
  placeName: z
    .string()
    .min(1, "Place name is required")
    .max(255, "Place name must be less than 255 characters"),
  placeAddress: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address must be less than 500 characters"),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

interface OnboardingModalProps {
  open: boolean;
  userEmail?: string;
}

export function OnboardingModal({ open, userEmail }: OnboardingModalProps) {
  const router = useRouter();
  const t = useTranslations("onboarding.modal");
  const { completeOnboarding, isLoading, error } = useCompleteOnboarding();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      organizationName: "",
      organizationEmail: userEmail || "",
      placeName: "",
      placeAddress: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setFormError(null);

    try {
      await completeOnboarding({
        merchant: {
          name: data.organizationName,
          email: data.organizationEmail || undefined,
        },
        place: {
          localName: data.placeName,
          address: data.placeAddress,
        },
      });

      // Show success message
      setIsSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete onboarding";
      setFormError(message);
    }
  });

  const handleContinue = () => {
    // Refresh the page to update session and hide modal
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Organization Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("organizationSection")}</h3>

                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("organizationName")} *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("organizationNamePlaceholder")}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizationEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("organizationEmail")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("organizationEmailPlaceholder")}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Place Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("placeSection")}</h3>

                  <FormField
                    control={form.control}
                    name="placeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("placeName")} *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("placeNamePlaceholder")}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placeAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("placeAddress")} *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("placeAddressPlaceholder")}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Error Display */}
                {(formError || error) && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {formError || error}
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("submitting") : t("submitButton")}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>

              <div className="text-center space-y-2">
                <DialogTitle className="text-2xl">{t("successTitle")}</DialogTitle>
                <DialogDescription className="text-base">
                  {t("successMessage")}
                </DialogDescription>
              </div>

              <Button onClick={handleContinue} size="lg" className="w-full">
                {t("continueButton")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
