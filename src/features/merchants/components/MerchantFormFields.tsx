// src/features/merchants/components/MerchantFormFields.tsx
"use client";

import * as React from "react";
import { RHFInput, RHFSelect } from "@/components/form/controls";

type Props = {
  disabled?: boolean;
  /** Show plan & status selects (hide if you need a minimal form) */
  showPlanAndStatus?: boolean;
};

export function MerchantFormFields({
  disabled,
  showPlanAndStatus = true,
}: Props) {
  return (
    <div className="space-y-4">
      <RHFInput
        name="name"
        label="Name"
        placeholder="Enter merchant name"
        requiredStar
        disabled={disabled}
      />

      <RHFInput
        name="email"
        label="Email"
        type="email"
        placeholder="merchant@example.com"
        disabled={disabled}
      />

      <RHFInput
        name="locale"
        label="Locale"
        placeholder="en-US"
        disabled={disabled}
      />

      {showPlanAndStatus && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RHFSelect
            name="plan"
            label="Plan"
            placeholder="Select plan"
            options={[
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro" },
              { value: "enterprise", label: "Enterprise" },
            ]}
            disabled={disabled}
          />

          <RHFSelect
            name="status"
            label="Status"
            placeholder="Select status"
            options={[
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
            ]}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
