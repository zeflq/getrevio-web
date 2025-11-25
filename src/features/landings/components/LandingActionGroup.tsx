"use client";

import * as React from "react";
import { VariantProps } from "class-variance-authority";
import { Eye, UploadCloud, Ban } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  iconActionGroup as IconActionGroup,
  iconAction,
} from "@/shared/ui/IconActionGroup";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type LandingActionButtonVariant = ButtonVariant;

type Props = {
  landingId?: string;
  previewHref: string;
  isPublished: boolean;
  hasUnpublishedChanges: boolean;
  previewLiveLabel: string;
  previewDraftLabel: string;
  canPublish: boolean;
  publishVariant: ButtonVariant;
  toggleButtonLabel: string;
  onPublish: () => void;
  onUnpublish: () => void;
  showUnpublish: boolean;
  isSubmitting: boolean;
  isToggleLoading: boolean;
  isFormDirty: boolean;
  unpublishLabel: string;
};

export function LandingActionGroup({
  landingId,
  previewHref,
  isPublished,
  hasUnpublishedChanges,
  previewLiveLabel,
  previewDraftLabel,
  canPublish,
  publishVariant,
  toggleButtonLabel,
  onPublish,
  onUnpublish,
  showUnpublish,
  isSubmitting,
  isToggleLoading,
  isFormDirty,
  unpublishLabel,
}: Props) {
  const previewLabel = isPublished
    ? hasUnpublishedChanges
      ? previewDraftLabel
      : previewLiveLabel
    : previewDraftLabel;

  const actions = React.useMemo<iconAction[]>(() => {
    const a: iconAction[] = [];

    if (landingId) {
      a.push({
        ariaLabel: previewLabel,
        label: previewLabel,
        icon: <Eye className="h-4 w-4" />,
        onClick: () => window.open(previewHref, "_blank", "noreferrer"),
        variant: "primaryOutline",
      });
    }

    if (canPublish) {
      a.push({
        ariaLabel: toggleButtonLabel,
        label: toggleButtonLabel,
        icon: <UploadCloud className="h-4 w-4" />,
        onClick: onPublish,
        variant: publishVariant ?? "default",
        disabled: isSubmitting || isToggleLoading || isFormDirty,
      });
    }

    if (showUnpublish) {
      a.push({
        ariaLabel: unpublishLabel,
        label: unpublishLabel,
        icon: <Ban className="h-4 w-4" />,
        onClick: onUnpublish,
        variant: "destructiveOutline",
        disabled: isSubmitting || isToggleLoading,
      });
    }

    return a;
  }, [
    landingId,
    previewLabel,
    previewHref,
    canPublish,
    toggleButtonLabel,
    publishVariant,
    onPublish,
    showUnpublish,
    unpublishLabel,
    onUnpublish,
    isSubmitting,
    isToggleLoading,
    isFormDirty,
  ]);

  return (
    <IconActionGroup
      actions={actions}
      mobileMenuLabel="Actions"
      condensed
      displayMode="auto"
      className="gap-1"
    />
  );
}
