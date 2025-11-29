"use client";

import { use } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useLandingForm } from "@/features/landings/hooks/useLandingForm";
import { usePublishAction } from "@/features/landings/hooks/usePublishAction";
import { useUnpublishAction } from "@/features/landings/hooks/useUnpublishAction";
import { useReadableError } from "@/lib/useReadableError";

import { LandingEditPageView } from "@/features/landings/components/LandingEditPageView";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default function MerchantLandingEditPage({ params }: PageParams) {
  const { id } = use(params);
  const tenantId = useActiveTenantId();

  const t = useTranslations("landings");
  const tToasts = useTranslations("landings.toasts");
  const router = useRouter();
  const readableError = useReadableError();

  const { form, landing, isReady, isLoading, isSubmitting, onSubmit, onReset } =
    useLandingForm(id, true);

  const publishAction = usePublishAction();
  const unpublishAction = useUnpublishAction();

  return (
    <LandingEditPageView
      tenantId={tenantId}
      t={t}
      tToasts={tToasts}
      router={router}
      readableError={readableError}
      form={form}
      landing={landing}
      isReady={isReady}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onReset={onReset}
      publishAction={publishAction}
      unpublishAction={unpublishAction}
    />
  );
}
