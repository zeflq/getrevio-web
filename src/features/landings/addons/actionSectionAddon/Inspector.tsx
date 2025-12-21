"use client";

import { useLocale } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFInput, RHFTextArea } from "@/components/form/controls";
import {
  resolveFieldLabel,
  resolveFieldPlaceholder,
} from "../../utils/translations";

export function ActionSectionAddonInspector({
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const locale = useLocale() as "en" | "fr" | "ar";

  // Use KIND i18n for field labels (shared across all instances)
  const titleLabel = resolveFieldLabel("actionSectionAddon", "title", locale);
  const titlePlaceholder = resolveFieldPlaceholder("actionSectionAddon", "title", locale);

  const subtitleLabel = resolveFieldLabel("actionSectionAddon", "subtitle", locale);
  const subtitlePlaceholder = resolveFieldPlaceholder("actionSectionAddon", "subtitle", locale);

  const descriptionLabel = resolveFieldLabel("actionSectionAddon", "description", locale);
  const descriptionPlaceholder = resolveFieldPlaceholder("actionSectionAddon", "description", locale);

  const buttonLabelLabel = resolveFieldLabel("actionSectionAddon", "buttonLabel", locale);
  const buttonLabelPlaceholder = resolveFieldPlaceholder("actionSectionAddon", "buttonLabel", locale);

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.title`}
        label={titleLabel}
        placeholder={titlePlaceholder}
        requiredStar
        disabled={disabled}
      />
      <RHFInput
        name={`${fieldName}.subtitle`}
        label={subtitleLabel}
        placeholder={subtitlePlaceholder}
        disabled={disabled}
      />
      <RHFTextArea
        name={`${fieldName}.description`}
        label={descriptionLabel}
        placeholder={descriptionPlaceholder}
        rows={3}
        disabled={disabled}
      />
      <RHFInput
        name={`${fieldName}.buttonLabel`}
        label={buttonLabelLabel}
        placeholder={buttonLabelPlaceholder}
        requiredStar
        disabled={disabled}
      />
    </div>
  );
}
