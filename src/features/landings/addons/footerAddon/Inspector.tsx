"use client";

import { useLocale } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFTextArea } from "@/components/form/controls/RHFTextArea";
import {
  resolveFieldLabel,
  resolveFieldPlaceholder,
} from "../../utils/translations";

export function FooterAddonInspector({ fieldName, disabled }: LandingAddonInspectorProps) {
  const locale = useLocale() as "en" | "fr" | "ar";

  // Use KIND i18n for field labels (shared across all instances)
  const textLabel = resolveFieldLabel("footerAddon", "text", locale);
  const textPlaceholder = resolveFieldPlaceholder("footerAddon", "text", locale);

  return (
    <div className="space-y-4">
      <RHFTextArea
        name={`${fieldName}.text`}
        label={textLabel}
        placeholder={textPlaceholder}
        requiredStar
        disabled={disabled}
      />
    </div>
  );
}
