"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { landingThemes } from "@/features/landings/theme/themes";
import type { ThemeListItem } from "@/features/themes/server/queries";
import { useResetTheme } from "@/features/themes/hooks/useThemeCrud";
import { DEFAULT_THEME_PRESET_KEY } from "@/features/themes/lib/themeMeta";
import type { ThemeMeta } from "@/types/domain";
import { useTranslations } from "next-intl";

type SingleThemeSelectorProps = {
  themeId: string;
  theme?: ThemeListItem | null;
};

const presetOptions = Object.values(landingThemes);
const paletteLabels: Array<{ key: keyof ThemeMeta["palette"]; label: string }> = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "text", label: "Text" },
];

export function SingleThemeSelector({ themeId, theme }: SingleThemeSelectorProps) {
  const currentPreset = theme?.meta?.presetKey ?? DEFAULT_THEME_PRESET_KEY;
  const [presetKey, setPresetKey] = React.useState(currentPreset);
  const t = useTranslations("merchantSettings.theme");

  React.useEffect(() => {
    setPresetKey(theme?.meta?.presetKey ?? DEFAULT_THEME_PRESET_KEY);
  }, [theme?.meta?.presetKey]);

  const { execute: resetTheme, isExecuting } = useResetTheme({
    onSuccess: () => {
      toast.success("Theme reset to preset");
    },
    onError: () => {
      toast.error("Failed to reset the theme.");
    },
  });

  const handleReset = () => {
    const merchantId = theme?.merchantId;
    if (!merchantId) {
      toast.error("Unable to determine merchant.");
      return;
    }

    resetTheme({
      id: themeId,
      merchantId,
      presetKey,
    });
  };

  const palette =
    landingThemes[presetKey]?.colors ?? landingThemes[DEFAULT_THEME_PRESET_KEY].colors;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{t("title")}</p>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Select value={presetKey} onValueChange={setPresetKey}>
          <SelectTrigger size="sm">
            <SelectValue placeholder={t("presetPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {presetOptions.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {paletteLabels.map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
          >
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t(`colors.${field.key}`)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-5 w-5 flex-none rounded-sm border border-border"
                style={{ backgroundColor: palette[field.key] }}
              />
              <span className="font-mono text-xs">{palette[field.key]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
          <Button disabled={!theme?.merchantId || isExecuting} onClick={handleReset}>
            {isExecuting ? t("resettingLabel") : t("resetButton")}
          </Button>
      </div>
    </div>
  );
}
