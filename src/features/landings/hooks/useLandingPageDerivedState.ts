"use client";

import type { UseFormReturn } from "react-hook-form";
import type { LandingFormValues } from "../model/landingSchema";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

type DerivedStateArgs = {
  t: ReturnType<typeof import("next-intl").useTranslations>;
  form: UseFormReturn<LandingFormValues>;
  landing: ReturnType<typeof import("../server/mappers").landingListItem> | null;
};

export function useLandingPageDerivedState({ t, form, landing }: DerivedStateArgs) {
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

  const { settings: settingsErrors, belongsTo: belongsToErrors, content: contentErrors } =
    form.formState.errors;

  const hasSettingsErrors = Boolean(settingsErrors || belongsToErrors);
  const hasContentErrors = Boolean(contentErrors);
  const hasFormErrors = hasSettingsErrors || hasContentErrors;

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

  const tabs = [
    { id: "settings", label: t("tabs.settings"), hasError: hasSettingsErrors },
    { id: "content", label: t("tabs.content"), hasError: hasContentErrors },
  ] as const;

  return {
    isPublished,
    hasUnpublishedChanges,
    canPublish,
    showUnpublish,
    previewHref,
    toggleButtonLabel,
    publishButtonVariant,
    hasSettingsErrors,
    hasContentErrors,
    hasFormErrors,
    tabs,
    previewLiveLabel,
    previewDraftLabel,
    unpublishLabel,
    isToggleLoading,
  };
}
