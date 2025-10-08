// default export so `import ThemeFormFields from "./ThemeFormFields"` works
"use client";

import { RHFInput } from "@/components/form/controls";

export default function ThemeFormFields({ disabled }: { disabled?: boolean }) {
  return (
    <div className="space-y-4">
      <RHFInput
        name="name"
        label="Name"
        placeholder="Brand Classic"
        requiredStar
        disabled={disabled}
      />
      <RHFInput
        name="logoUrl"
        label="Logo URL"
        placeholder="https://example.com/logo.png"
        disabled={disabled}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RHFInput
          name="brandColor"
          label="Brand color"
          placeholder="#0EA5E9"
          disabled={disabled}
        />
        <RHFInput
          name="accentColor"
          label="Accent color"
          placeholder="#F59E0B"
          disabled={disabled}
        />
        <RHFInput
          name="textColor"
          label="Text color"
          placeholder="#111827"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
