"use client";

import { useFormContext } from "react-hook-form";
import { RHFInput } from "@/components/form/controls";
import { cn } from "@/lib/utils";

type Props = {
  /** Path prefix inside your form values, e.g. "landingDefaults" or "landingOverride" */
  name: string;
  className?: string;
  disabled?: boolean;
  /** Optional: show helper copy about precedence when used in Campaign */
  contextHint?: "place" | "campaign";
};

export default function LandingDefaultsFields({
  name,
  className,
  disabled,
  contextHint,
}: Props) {
  // ensures we're inside a <Form> provider
  useFormContext();

  return (
    <div className={cn("grid gap-4", className)}>
      {contextHint === "campaign" && (
        <p className="text-xs text-muted-foreground">
          Leave a field blank to fall back to the Place default.
        </p>
      )}

      <RHFInput
        name={`${name}.title`}
        label="Title"
        placeholder="How was your visit?"
        disabled={disabled}
      />
      <RHFInput
        name={`${name}.subtitle`}
        label="Subtitle"
        placeholder="We'd love your feedback."
        disabled={disabled}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RHFInput
          name={`${name}.primaryCtaLabel`}
          label="Primary CTA Label"
          placeholder="Leave a Google review"
          disabled={disabled}
        />
        <RHFInput
          name={`${name}.primaryCtaUrl`}
          label="Primary CTA URL"
          placeholder="https://search.google.com/local/writereview?placeid=..."
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RHFInput
          name={`${name}.secondaryCtaLabel`}
          label="Secondary CTA Label (optional)"
          placeholder="View menu"
          disabled={disabled}
        />
        <RHFInput
          name={`${name}.secondaryCtaUrl`}
          label="Secondary CTA URL (optional)"
          placeholder="https://example.com/menu"
          disabled={disabled}
        />
      </div>
    </div>
  );
}