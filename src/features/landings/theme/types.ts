import type { ThemePalette, ThemeTokens } from "@/types/domain";

export type LandingThemeData = {
  id: string;
  name: string;
  palette: ThemePalette;
  tokens: ThemeTokens;
};
