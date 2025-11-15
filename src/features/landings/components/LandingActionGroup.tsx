"use client";

import { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {landingId && (
        <Button variant="outline" asChild>
          <a href={previewHref} target="_blank" rel="noreferrer">
            {previewLabel}
          </a>
        </Button>
      )}

      {canPublish && (
        <Button
          type="button"
          variant={publishVariant}
          onClick={onPublish}
          disabled={isSubmitting || isToggleLoading || isFormDirty}
        >
          {toggleButtonLabel}
        </Button>
      )}

      {showUnpublish && (
        <Button
          type="button"
          variant="outline"
          onClick={onUnpublish}
          disabled={isSubmitting || isToggleLoading}
        >
          {unpublishLabel}
        </Button>
      )}
    </div>
  );
}
