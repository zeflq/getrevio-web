"use client";

import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { Landing } from "@/types/domain";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

type DerivedStateArgs = {
  landing: Landing | null;
  t: ReturnType<typeof import("next-intl").useTranslations>;
};

export function useLandingPageDerivedState({ t, landing }: DerivedStateArgs) {
  const isPublished = landing?.status === "published";
  const contentDraft = landing?.contentDraft ?? null;
  const contentPublished = landing?.contentPublished ?? null;

  const hasUnpublishedChanges = Boolean(
    isPublished &&
      contentPublished &&
      JSON.stringify(contentDraft) !== JSON.stringify(contentPublished)
  );

  const canPublish = !isPublished || hasUnpublishedChanges;
  const showUnpublish = isPublished && !hasUnpublishedChanges;

  const previewHref = landing
    ? isPublished
      ? `/landings/${landing.id}?preview=live`
      : `/landings/${landing.id}?preview=draft`
    : "";

  const previewLiveLabel = t("common.previewLive");
  const previewDraftLabel = t("common.previewDraft");
  const unpublishLabel = t("common.unpublish");

  const isToggleLoading = false;

  const toggleButtonLabel = (() => {
    if (isToggleLoading) return t("common.loading");
    if (!isPublished) return t("common.publish");
    if (hasUnpublishedChanges) return t("common.publishChanges");
    return t("common.unpublish");
  })();

  const publishButtonVariant: ButtonVariant = !isPublished
    ? "default"
    : hasUnpublishedChanges
    ? "outline"
    : "secondary";

  return {
    isPublished,
    hasUnpublishedChanges,
    canPublish,
    showUnpublish,
    previewHref,
    toggleButtonLabel,
    publishButtonVariant,
    previewLiveLabel,
    previewDraftLabel,
    unpublishLabel,
    isToggleLoading,
  };
}
