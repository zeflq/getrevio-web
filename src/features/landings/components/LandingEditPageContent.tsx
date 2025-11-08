"use client";

import * as React from "react";
import { FormProvider } from "react-hook-form";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LandingFormFields } from "./LandingFormFields";
import { useMerchantsLite } from "@/features/merchants";
import { useLandingForm } from "../hooks/useLandingForm";
import { LandingContentEditor } from "../editor/LandingContentEditor";

type Props = {
  id: string;
};

export function LandingEditPageContent({ id }: Props) {
  const router = useRouter();
  const {
    form,
    landing,
    isReady,
    isLoading,
    isSubmitting,
    onSubmit,
    onReset,
  } = useLandingForm(id);
  const merchantsLiteQuery = useMerchantsLite();
  const status = form.watch("settings.status");
  const isPublished = status === "published";
  const previewHref = landing ? `/landings/${landing.id}` : "#";

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

  const togglePublish = () => {
    form.setValue("settings.status", isPublished ? "draft" : "published", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (!landing && !isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Landing not found</h1>
            <p className="text-sm text-muted-foreground">The requested landing does not exist or you do not have access.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Edit Landing</h1>
            <p className="text-sm text-muted-foreground">Manage settings and block-based content.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPublished && (
            <>
              <Button variant="outline" asChild>
                <a href={previewHref} target="_blank" rel="noreferrer">
                  Preview
                </a>
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/admin/shortlinks?landingId=${landing?.id ?? id}`)}
              >
                Generate Shortlink
              </Button>
            </>
          )}
          <Button variant={isPublished ? "secondary" : "default"} onClick={togglePublish}>
            {isPublished ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{landing?.name ?? "Landing"}</CardTitle>
          <CardDescription>Changes are saved when you click “Save changes”.</CardDescription>
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
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                  </TabsList>
                  <TabsContent value="settings" className="space-y-4">
                    <LandingFormFields
                      disabled={isSubmitting}
                      merchantId={landing?.merchantId}
                      merchantsLite={merchantsLiteQuery.data ?? []}
                    />
                  </TabsContent>
                  <TabsContent value="content" className="space-y-4">
                    <LandingContentEditor landing={landing} disabled={isSubmitting} />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onReset} disabled={isSubmitting}>
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.formState.isDirty || isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save changes"}
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
