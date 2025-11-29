"use client";

import * as React from "react";
import { Eye, UploadCloud, Ban } from "lucide-react";
import type { iconAction } from "@/shared/ui/IconActionGroup";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

type Args = {
  landing: any | null;
  form: any;
  isPublished: boolean;
  hasUnpublishedChanges: boolean;
  canPublish: boolean;
  showUnpublish: boolean;
  previewHref: string;
  toggleButtonLabel: string;
  publishButtonVariant: ButtonVariant;
  isSubmitting: boolean;
  isToggleLoading: boolean;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  handlePublish: () => void;
  handleUnpublish: () => void;
};

export function useLandingHeaderActions({
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
}: Args): iconAction[] {
  const previewLiveLabel = t("common.previewLive");
  const previewDraftLabel = t("common.previewDraft");
  const unpublishLabel = t("common.unpublish");

  return React.useMemo(() => {
    const actions: iconAction[] = [];

    const previewLabel = isPublished
      ? hasUnpublishedChanges
        ? previewDraftLabel
        : previewLiveLabel
      : previewDraftLabel;

    if (landing?.id) {
      actions.push({
        ariaLabel: previewLabel,
        label: previewLabel,
        tooltip: previewLabel,
        icon: <Eye className="h-4 w-4" />,
        onClick: () => {
          if (!previewHref) return;
          window.open(previewHref, "_blank", "noreferrer");
        },
        variant: "primaryOutline" as ButtonVariant,
      });
    }

    if (canPublish) {
      actions.push({
        ariaLabel: toggleButtonLabel,
        label: toggleButtonLabel,
        tooltip: toggleButtonLabel,
        icon: <UploadCloud className="h-4 w-4" />,
        onClick: handlePublish,
        variant: publishButtonVariant ?? "default",
        disabled: isSubmitting || isToggleLoading || form.formState.isDirty,
        loading: isToggleLoading,
      });
    }

    if (showUnpublish) {
      actions.push({
        ariaLabel: unpublishLabel,
        label: unpublishLabel,
        tooltip: unpublishLabel,
        icon: <Ban className="h-4 w-4" />,
        onClick: handleUnpublish,
        variant: "destructiveOutline" as ButtonVariant,
        disabled: isSubmitting || isToggleLoading,
        loading: isToggleLoading,
      });
    }

    return actions;
  }, [
    landing?.id,
    isPublished,
    hasUnpublishedChanges,
    previewDraftLabel,
    previewLiveLabel,
    previewHref,
    canPublish,
    toggleButtonLabel,
    publishButtonVariant,
    isSubmitting,
    isToggleLoading,
    form.formState.isDirty,
    showUnpublish,
    unpublishLabel,
    handlePublish,
    handleUnpublish,
  ]);
}
