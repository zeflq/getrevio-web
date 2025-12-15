"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useReadableError } from "@/lib/useReadableError";

import { EditPageContainer } from "@/shared/ui/EditPageContainer";
import { useLandingEditForm } from "../hooks/useLandingEditForm";
import { useLandingPageDerivedState } from "../hooks/useLandingPageDerivedState";
import { useLandingPublishHandlers } from "../hooks/useLandingPublishHandlers";
import { useLandingHeaderActions } from "../hooks/useLandingHeaderActions";
import { usePublishAction } from "../hooks/usePublishAction";
import { useUnpublishAction } from "../hooks/useUnpublishAction";
import { useDirtyBeforeUnload } from "../hooks/useDirtyBeforeUnload";

import { LandingSettingsTab } from "./LandingSettingsTab";
import { LandingContentTab } from "./LandingContentTab";
import { LandingEditSkeleton } from "./LandingEditSkeleton";
import { LandingNotFoundState } from "./LandingNotFoundState";

type LandingEditPageViewProps = {
  id: string;
  tenantId: string | null;
};

export function LandingEditPageView({ id, tenantId }: LandingEditPageViewProps) {
  const router = useRouter();
  const t = useTranslations("landings");
  const tToasts = useTranslations("landings.toasts");
  const readableError = useReadableError();

  const { form, landing, isReady, isLoading, isSubmitting, onSubmit, onReset } =
    useLandingEditForm(id, true);

  const publishAction = usePublishAction();
  const unpublishAction = useUnpublishAction();

  useDirtyBeforeUnload(form.formState.isDirty);

  const derivedState = useLandingPageDerivedState({ t, landing });
  const { handlePublish, handleUnpublish, isToggleLoading } = useLandingPublishHandlers({
    landing,
    publishAction,
    unpublishAction,
    hasUnpublishedChanges: derivedState.hasUnpublishedChanges,
    tToasts,
    readableError,
    router,
  });

  const headerActions = useLandingHeaderActions({
    landing,
    form,
    isPublished: derivedState.isPublished,
    hasUnpublishedChanges: derivedState.hasUnpublishedChanges,
    canPublish: derivedState.canPublish,
    showUnpublish: derivedState.showUnpublish,
    previewHref: derivedState.previewHref,
    toggleButtonLabel: derivedState.toggleButtonLabel,
    publishButtonVariant: derivedState.publishButtonVariant,
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

  return (
    <EditPageContainer
      title={t("form.title")}
      description={t("form.description")}
      onBack={() => router.back()}
      form={form}
      tabs={[
        {
          id: "settings",
          label: t("tabs.settings"),
          error: (errors) => Boolean(errors.settings || errors.belongsTo),
        },
        {
          id: "content",
          label: t("tabs.content"),
          error: (errors) => Boolean(errors.content),
        },
      ]}
      defaultTab="settings"
      headerActions={headerActions}
      primaryLabel={t("common.saveChanges")}
      secondaryLabel={t("common.reset")}
      onPrimary={onSubmit}
      onSecondary={onReset}
      isSubmitting={isSubmitting}
      loadingContent={<LandingEditSkeleton />}
      isLoading={!isReady}
      formErrorMessage={t("common.formHasErrors")}
    >
      {(activeTab) => (
        <>
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
        </>
      )}
    </EditPageContainer>
  );
}
