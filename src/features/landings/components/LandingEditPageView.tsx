"use client";

import * as React from "react";
import { FormProvider } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { EditPageLayout } from "@/shared/ui/EditPageLayout";

import { LandingSettingsTab } from "./LandingSettingsTab";
import { LandingContentTab } from "./LandingContentTab";
import { LandingEditSkeleton } from "./LandingEditSkeleton";
import { LandingNotFoundState } from "./LandingNotFoundState";
import { useDirtyBeforeUnload } from "../hooks/useDirtyBeforeUnload";
import { useLandingPageDerivedState } from "../hooks/useLandingPageDerivedState";
import { useLandingPublishHandlers } from "../hooks/useLandingPublishHandlers";
import { useLandingHeaderActions } from "../hooks/useLandingHeaderActions";

import type { LandingListItem } from "../server/mappers";
import type { LandingFormValues } from "../model/landingSchema";
import type { LandingPublishAction } from "../hooks/usePublishAction";
import type { LandingUnpublishAction } from "../hooks/useUnpublishAction";

type LandingEditPageViewProps = {
  tenantId: string | null;
  t: ReturnType<typeof useTranslations>;
  tToasts: ReturnType<typeof useTranslations>;
  router: ReturnType<typeof import("@/i18n/navigation").useRouter>;
  readableError: (error: unknown, fallbackKey?: string) => string;
  form: UseFormReturn<LandingFormValues>;
  landing: LandingListItem | null;
  isReady: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onReset: () => void;
  publishAction: LandingPublishAction;
  unpublishAction: LandingUnpublishAction;
};

type ActiveTab = "settings" | "content";

export function LandingEditPageView(props: LandingEditPageViewProps) {
  const {
    tenantId,
    t,
    tToasts,
    router,
    readableError,
    form,
    landing,
    isReady,
    isLoading,
    isSubmitting,
    onSubmit,
    onReset,
    publishAction,
    unpublishAction,
  } = props;

  const [activeTab, setActiveTab] = React.useState<ActiveTab>("settings");

  useDirtyBeforeUnload(form.formState.isDirty);

  const {
    isPublished,
    hasUnpublishedChanges,
    canPublish,
    showUnpublish,
    previewHref,
    toggleButtonLabel,
    publishButtonVariant,
    hasFormErrors,
    tabs,
  } = useLandingPageDerivedState({ t, form, landing });

  const { handlePublish, handleUnpublish, isToggleLoading } = useLandingPublishHandlers({
    landing,
    publishAction,
    unpublishAction,
    hasUnpublishedChanges,
    tToasts,
    readableError,
    router,
  });

  const headerActions = useLandingHeaderActions({
    landing,
    form,
    isPublished,
    hasUnpublishedChanges,
    canPublish,
    showUnpublish,
    previewHref,
    toggleButtonLabel,
    publishButtonVariant,
    isSubmitting,
    isToggleLoading,
    t,
    handlePublish,
    handleUnpublish,
  });

  if (!landing && !isLoading) {
    return (
      <LandingNotFoundState
        title={t("form.title")}
        description={t("form.description")}
        backLabel={t("common.backToList")}
        backToListHref="/m/landings"
        onBack={() => router.back()}
      />
    );
  }

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const handlePrimary = () => formRef.current?.requestSubmit();
  const handleSecondary = () => onReset();

  return (
    <EditPageLayout
      title={t("form.title")}
      description={t("form.description")}
      onBack={() => router.back()}
      headerActions={headerActions}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(value) => setActiveTab(value as ActiveTab)}
      showFooter
      primaryLabel={t("common.saveChanges")}
      secondaryLabel={t("common.reset")}
      primaryDisabled={!form.formState.isDirty || isSubmitting}
      secondaryDisabled={isSubmitting}
      onPrimary={handlePrimary}
      onSecondary={handleSecondary}
    >
      {!isReady ? (
        <LandingEditSkeleton />
      ) : (
        <FormProvider {...form} key={landing?.id}>
          <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
            {activeTab === "settings" && (
              <LandingSettingsTab
                isSubmitting={isSubmitting}
                tenantId={tenantId}
                landing={landing}
              />
            )}

            {activeTab === "content" && (
              <LandingContentTab landing={landing} isSubmitting={isSubmitting} t={t} />
            )}

            {hasFormErrors && (
              <p className="text-xs text-destructive/80">{t("common.formHasErrors")}</p>
            )}
          </form>
        </FormProvider>
      )}
    </EditPageLayout>
  );
}
