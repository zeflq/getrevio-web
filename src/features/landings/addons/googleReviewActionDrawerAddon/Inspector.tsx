"use client";

import { useLocale } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFInput } from "@/components/form/controls";
import {
  resolveFieldLabel,
  resolveFieldPlaceholder,
} from "../../utils/translations";

export function GoogleReviewActionDrawerAddonInspector({
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const locale = useLocale() as "en" | "fr" | "ar";

  // Use KIND i18n for field labels (shared across all instances)
  const googleUrlLabel = resolveFieldLabel("googleReviewActionDrawerAddon", "googleUrl", locale);
  const googleUrlPlaceholder = resolveFieldPlaceholder("googleReviewActionDrawerAddon", "googleUrl", locale);

  const placeLabelLabel = resolveFieldLabel("googleReviewActionDrawerAddon", "placeLabel", locale);
  const placeLabelPlaceholder = resolveFieldPlaceholder("googleReviewActionDrawerAddon", "placeLabel", locale);

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.googleUrl`}
        label={googleUrlLabel}
        placeholder={googleUrlPlaceholder}
        requiredStar
        disabled={disabled}
      />
      <RHFInput
        name={`${fieldName}.placeLabel`}
        label={placeLabelLabel}
        placeholder={placeLabelPlaceholder}
        disabled={disabled}
      />
    </div>
  );
}
