import type { ThemeMeta } from "@/types/domain";
import { landingThemes, landingThemeTokens } from "@/features/landings/theme/themes";

export const DEFAULT_THEME_PRESET_KEY = "neutral";

export function buildThemeMeta(presetKey: string = DEFAULT_THEME_PRESET_KEY): ThemeMeta {
  const palettePreset = landingThemes[presetKey] ?? landingThemes[DEFAULT_THEME_PRESET_KEY];
  const palette = palettePreset.colors;
  const tokens = landingThemeTokens[presetKey] ?? landingThemeTokens[DEFAULT_THEME_PRESET_KEY];

  return {
    presetKey: palettePreset.id,
    palette,
    tokens,
  };
}
