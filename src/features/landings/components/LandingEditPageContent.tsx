"use client";

import * as React from "react";
import { FormProvider } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LiteListe } from "@/types/lists";

import { LandingFormFields } from "./LandingFormFields";
import { useLandingForm } from "../hooks/useLandingForm";
import { usePublishAction } from "../hooks/usePublishAction";
import { useUnpublishAction } from "../hooks/useUnpublishAction";
import { LandingContentEditor } from "../editor/LandingContentEditor";
import { useReadableError } from "@/lib/useReadableError";
import { LandingActionGroup, type LandingActionButtonVariant } from "./LandingActionGroup";

type Props = {
  id: string;
  merchantId?: string;
  merchantsLite: LiteListe[];
  shortlinksPath?: string;
};

export function LandingEditPageContent({
  id,
  merchantId,
  merchantsLite,
  shortlinksPath = "/admin/shortlinks",
}: Props) {
  const router = useRouter();
  const t = useTranslations("landings");
  const tToasts = useTranslations("landings.toasts");

  const {
    form,
    landing,
    isReady,
    isLoading,
    isSubmitting,
    onSubmit,
    onReset,
  } = useLandingForm(id);
  const readableError = useReadableError();
  const { execute: publishLanding, isExecuting: isPublishing } = usePublishAction();
  const { execute: unpublishLanding, isExecuting: isUnpublishing } = useUnpublishAction();

  const isToggleLoading = isPublishing || isUnpublishing;
  
  const isPublished = landing?.status === "published";
  const contentDraft = landing?.contentDraft ?? null;
  const contentPublished = landing?.contentPublished ?? null;

  const hasUnpublishedChanges = Boolean(
    isPublished &&
      contentPublished &&
      JSON.stringify(contentDraft) !== JSON.stringify(contentPublished)
  );

  const publishVariant: LandingActionButtonVariant = !isPublished
    ? "default"
    : hasUnpublishedChanges
    ? "warning"
    : "secondary";

  const canPublish =
    !isPublished || hasUnpublishedChanges; // first publish OR publish changes

  const previewHref = isPublished
    ? `/landings/${landing?.id}?preview=live`
    : `/landings/${landing?.id}?preview=draft`;

  const toggleButtonLabel = (() => {
    if (isToggleLoading) return t("common.loading");
    if (!isPublished) return t("common.publish");
    if (hasUnpublishedChanges) return t("common.publishChanges");
    return t("common.unpublish");
  })();

  // Prevent losing changes when leaving
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form.formState.isDirty]);

  const handlePublish = async () => {
    if (!landing?.merchantId) return;

    try {
      await publishLanding({ id: landing.id, merchantId: landing.merchantId });
      toast.success(
        hasUnpublishedChanges
          ? tToasts("publishedChanges")
          : tToasts("published")
      );
      router.refresh();
    } catch (error) {
      toast.error(readableError(error, "generic"));
    }
  };

  const handleUnpublish = async () => {
    if (!landing?.merchantId) return;
    try {
      await unpublishLanding({ id: landing.id, merchantId: landing.merchantId });
      toast.success(tToasts("unpublished"));
      router.refresh();
    } catch (error) {
      toast.error(readableError(error, "generic"));
    }
  };

  if (!landing && !isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("common.landingNotFound")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("common.landingNotFoundDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 w-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="py-5" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("form.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("form.description")}</p>
          </div>
        </div>

        <LandingActionGroup
          landingId={landing?.id}
          previewHref={previewHref}
          isPublished={isPublished}
          hasUnpublishedChanges={hasUnpublishedChanges}
          previewLiveLabel={t("common.previewLive")}
          previewDraftLabel={t("common.previewDraft")}
          canPublish={canPublish}
          publishVariant={publishVariant}
          toggleButtonLabel={toggleButtonLabel}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          showUnpublish={isPublished && !hasUnpublishedChanges}
          isSubmitting={isSubmitting}
          isToggleLoading={isToggleLoading}
          isFormDirty={form.formState.isDirty}
          unpublishLabel={t("common.unpublish")}
        />
      </div>

      {/* MAIN FORM */}
      <Card className="w-full md:max-w-3/4 m-auto">
        <CardHeader>
          <CardTitle>{landing?.name ?? t("common.landing")}</CardTitle>
          <CardDescription>{t("common.changesSavedOnSubmit")}</CardDescription>
        </CardHeader>

        <CardContent>
          {!isReady ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <FormProvider {...form} key={id}>
              <form onSubmit={onSubmit} className="space-y-6">
                <Tabs defaultValue="settings" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
                    <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="settings" className="space-y-4">
                    <LandingFormFields
                      disabled={isSubmitting}
                      merchantId={merchantId ?? landing?.merchantId}
                      merchantsLite={merchantsLite}
                      existingSlug={landing?.slug}
                    />
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <LandingContentEditor landing={landing} disabled={isSubmitting} />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onReset}
                    disabled={isSubmitting}
                  >
                    {t("common.reset")}
                  </Button>

                  <Button
                    type="submit"
                    disabled={!form.formState.isDirty || isSubmitting}
                  >
                    {isSubmitting ? t("common.loading") : t("common.saveChanges")}
                  </Button>
                </div>
              </form>
            </FormProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
