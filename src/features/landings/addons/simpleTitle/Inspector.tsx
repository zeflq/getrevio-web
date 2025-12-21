"use client";

import { useLocale } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFInput, RHFTextArea } from "@/components/form/controls";
import { resolveFieldLabel, resolveFieldPlaceholder } from "../../utils/translations";

export function SimpleTitleAddonInspector({ fieldName, disabled }: LandingAddonInspectorProps) {
  const locale = useLocale() as "en" | "fr" | "ar";

  // Use KIND i18n for field labels (shared across all instances)
  const titleLabel = resolveFieldLabel("simpleTitle", "title", locale);
  const titlePlaceholder = resolveFieldPlaceholder("simpleTitle", "title", locale);

  const subtitleLabel = resolveFieldLabel("simpleTitle", "subtitle", locale);
  const subtitlePlaceholder = resolveFieldPlaceholder("simpleTitle", "subtitle", locale);

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.title`}
        label={titleLabel}
        placeholder={titlePlaceholder}
        requiredStar
        disabled={disabled}
      />
      <RHFTextArea
        name={`${fieldName}.subtitle`}
        label={subtitleLabel}
        placeholder={subtitlePlaceholder}
        rows={3}
        disabled={disabled}
      />
    </div>
  );
}
