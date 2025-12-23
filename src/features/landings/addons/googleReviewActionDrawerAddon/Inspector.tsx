"use client";

import { useFormContext } from "react-hook-form";
import { useLocale } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFInput } from "@/components/form/controls";
import {
  resolveFieldLabel,
  resolveFieldPlaceholder,
} from "../../utils/translations";
import { replaceGooglePlaceId } from "../../utils/googleReviewUrl";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function GoogleReviewActionDrawerAddonInspector({
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const locale = useLocale() as "en" | "fr" | "ar";
  const form = useFormContext();

  // Get belongsTo from form (contains googlePlaceId for both Place and Campaign)
  const belongsTo = form.getValues("belongsTo");
  const googlePlaceId = belongsTo?.googlePlaceId;

  // Handler to auto-fill Google review URL
  const handleAutoFill = () => {
    if (!googlePlaceId) return;

    const currentUrl = form.getValues(`${fieldName}.googleUrl`);

    // Build URL when empty or contains placeholder
    if (!currentUrl || currentUrl.includes("placeid=xxx")) {
      const generatedUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;
      form.setValue(`${fieldName}.googleUrl`, generatedUrl, {
        shouldDirty: true,
      });
    } else {
      // Replace any existing placeid with the current googlePlaceId
      const updatedUrl = currentUrl.replace(
        /placeid=[^&]*/,
        `placeid=${googlePlaceId}`
      );
      form.setValue(`${fieldName}.googleUrl`, updatedUrl, {
        shouldDirty: true,
      });
    }
  };

  // Use KIND i18n for field labels (shared across all instances)
  const googleUrlLabel = resolveFieldLabel(
    "googleReviewActionDrawerAddon",
    "googleUrl",
    locale
  );
  const googleUrlPlaceholder = resolveFieldPlaceholder(
    "googleReviewActionDrawerAddon",
    "googleUrl",
    locale
  );

  const placeLabelLabel = resolveFieldLabel(
    "googleReviewActionDrawerAddon",
    "placeLabel",
    locale
  );
  const placeLabelPlaceholder = resolveFieldPlaceholder(
    "googleReviewActionDrawerAddon",
    "placeLabel",
    locale
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <RHFInput
          name={`${fieldName}.googleUrl`}
          label={googleUrlLabel}
          placeholder={googleUrlPlaceholder}
          requiredStar
          disabled={disabled}
          description={
            googlePlaceId
              ? "Click the button to auto-fill from place's Google Place ID"
              : "Enter Google review URL manually (no Google Place ID available)"
          }
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoFill}
          disabled={disabled || !googlePlaceId}
          className="w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {googlePlaceId
            ? "Auto-fill URL from Google Place ID"
            : "No Google Place ID available"}
        </Button>
      </div>
      <RHFInput
        name={`${fieldName}.placeLabel`}
        label={placeLabelLabel}
        placeholder={placeLabelPlaceholder}
        disabled={disabled}
      />
    </div>
  );
}
