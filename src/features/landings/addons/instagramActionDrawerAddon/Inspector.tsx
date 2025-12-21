"use client";

import { useLocale } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFInput } from "@/components/form/controls";
import {
  resolveFieldLabel,
  resolveFieldPlaceholder,
} from "../../utils/translations";

export function InstagramActionDrawerAddonInspector({
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const locale = useLocale() as "en" | "fr" | "ar";

  // Use KIND i18n for field labels (shared across all instances)
  const instagramUrlLabel = resolveFieldLabel("instagramActionDrawerAddon", "instagramUrl", locale);
  const instagramUrlPlaceholder = resolveFieldPlaceholder("instagramActionDrawerAddon", "instagramUrl", locale);

  const handleLabel = resolveFieldLabel("instagramActionDrawerAddon", "handle", locale);
  const handlePlaceholder = resolveFieldPlaceholder("instagramActionDrawerAddon", "handle", locale);

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.instagramUrl`}
        label={instagramUrlLabel}
        placeholder={instagramUrlPlaceholder}
        requiredStar
        disabled={disabled}
      />
      <RHFInput
        name={`${fieldName}.handle`}
        label={handleLabel}
        placeholder={handlePlaceholder}
        disabled={disabled}
      />
    </div>
  );
}
