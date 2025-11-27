"use client";

import * as React from "react";
import type { Theme } from "@/types/domain";
import { landingThemeDefaults, DEFAULT_THEME_ID } from "@/features/landings/theme/themes";
import type { LandingThemeData } from "@/features/landings/theme/types";

export interface LandingThemeProviderProps {
  themes: Theme[];
  themeId?: string;
  children: React.ReactNode;
}

type ThemeOption = { id: string; name: string };

type ThemeContextType = {
  currentThemeId: string;
  options: ThemeOption[];
  setTheme: (themeId: string) => void;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function useLandingTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useLandingTheme must be used within LandingThemeProvider");
  return ctx;
}

export function LandingThemeProvider({ themes, themeId, children }: LandingThemeProviderProps) {
  // build map once from defaults + dynamic themes
  const themeMap: Record<string, LandingThemeData> = React.useMemo(() => {
    const map: Record<string, LandingThemeData> = themes.length > 0 ? {}:{ ...landingThemeDefaults };
    for (const theme of themes) {
      if (theme.meta) {
        map[theme.id] = {
          id: theme.id,
          name: theme.name,
          palette: theme.meta.palette,
          tokens: theme.meta.tokens,
        };
      }
    }
    return map;
  }, [themes]);

  // single place to resolve the effective id with fallback
  const resolveId = React.useCallback(
    (id?: string) => (id && themeMap[id] ? id : (themeMap[DEFAULT_THEME_ID] ? DEFAULT_THEME_ID : Object.keys(themeMap)[0])),
    [themeMap]
  );

  // controlled/uncontrolled: start from prop or default
  const [currentThemeId, setCurrentThemeId] = React.useState(() => resolveId(themeId));

  // update if the prop changes or if theme list changes
  React.useEffect(() => {
    setCurrentThemeId(prev => resolveId(themeId ?? prev));
  }, [themeId, resolveId]);

  const activeTheme = themeMap[currentThemeId];
  const { palette, tokens } = activeTheme;

  const cssVars = React.useMemo(
    () =>
      ({
        "--landing-primary": palette.primary,
        "--landing-secondary": palette.secondary,
        "--landing-accent": palette.accent,
        "--landing-background": palette.background,
        "--landing-text": palette.text,

        "--landing-surface": tokens.surface,
        "--landing-surface-soft": tokens.surfaceSoft,
        "--landing-border": tokens.border,
        "--landing-muted-text": tokens.mutedText,

        "--landing-cta-bg": tokens.ctaBg,
        "--landing-cta-text": tokens.ctaText,
        "--landing-cta-hover-bg": tokens.ctaHoverBg,

        "--landing-slot-bg": tokens.slotBackground,
        "--landing-slot-tile-bg": tokens.slotTileBg,
        "--landing-slot-tile-border": tokens.slotTileBorder,
        "--landing-slot-icon": tokens.slotIcon,
        "--landing-slot-center-bg": tokens.slotCenterBg,
        "--landing-slot-center-text": tokens.slotCenterText,
        "--landing-slot-glow-primary": tokens.slotGlowPrimary,
        "--landing-slot-glow-accent": tokens.slotGlowAccent,
      } as React.CSSProperties),
    [palette, tokens]
  );
  // 2) Push these vars on :root so the Drawer portal can see them
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, String(value));
    });

    return () => {
      Object.keys(cssVars).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [cssVars]);

  const options = React.useMemo<ThemeOption[]>(
    () => Object.values(themeMap).map(t => ({ id: t.id, name: t.name })),
    [themeMap]
  );
  const value = React.useMemo(
    () => ({ 
      currentThemeId,
      options,
      setTheme: (id: string) => setCurrentThemeId(resolveId(id)) 
    }),
    [currentThemeId, options, resolveId]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className="min-h-full flex justify-center" 
        style={{
          ...cssVars,
          backgroundColor: palette.background,
          color: palette.text 
        }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
