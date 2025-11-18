"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import { RHFInput, RHFSelect } from "@/components/form/controls";
import { landingThemes, landingThemeTokens } from "@/features/landings/theme/themes";

export default function ThemeFormFields({ disabled }: { disabled?: boolean }) {
  const { setValue, watch } = useFormContext<any>();

  const presetOptions = Object.values(landingThemes).map((theme) => ({
    value: theme.id,
    label: theme.name,
  }));

  const presetKey = watch("meta.presetKey") ?? "neutral";

  const applyPreset = (key: string) => {
    const palette = landingThemes[key]?.colors ?? landingThemes.neutral.colors;
    const tokens = landingThemeTokens[key];

    setValue("meta.presetKey", key, { shouldDirty: true, shouldValidate: true });
    setValue("meta.palette", palette, { shouldDirty: true, shouldValidate: true });
    if (tokens) {
      setValue("meta.tokens", tokens, { shouldDirty: true, shouldValidate: true });
    }
  };

  React.useEffect(() => {
    applyPreset(presetKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <RHFInput
        name="name"
        label="Name"
        placeholder="Brand Classic"
        requiredStar
        disabled={disabled}
      />

      <RHFSelect
        name="meta.presetKey"
        label="Preset"
        options={presetOptions}
        requiredStar
        disabled={disabled}
        onValueChange={(value) => {
          if (value) {
            applyPreset(value);
          }
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RHFInput
          name="meta.palette.primary"
          label="Primary color"
          placeholder="#06B6D4"
          disabled={disabled}
        />
        <RHFInput
          name="meta.palette.secondary"
          label="Secondary color"
          placeholder="#0EA5E9"
          disabled={disabled}
        />
        <RHFInput
          name="meta.palette.accent"
          label="Accent color"
          placeholder="#F59E0B"
          disabled={disabled}
        />
        <RHFInput
          name="meta.palette.background"
          label="Background color"
          placeholder="#F8FAFC"
          disabled={disabled}
        />
        <RHFInput
          name="meta.palette.text"
          label="Text color"
          placeholder="#0F172A"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
