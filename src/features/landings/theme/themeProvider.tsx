"use client";

import * as React from "react";
import type { ThemeType } from "./themes";
import { landingThemes, landingThemeTokens } from "./themes";

export interface LandingThemeProviderProps {
  themes: Record<string, ThemeType>;
  themeId?: string;
  children: React.ReactNode;
}

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (themeId: string) => void;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);

export function useLandingTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useLandingTheme must be used within LandingThemeProvider");
  return ctx;
}

export function LandingThemeProvider({
  themes,
  themeId,
  children,
}: LandingThemeProviderProps) {
  const defaultThemeId = themeId || "neutral"; //neutral,luxury,cozy,boutique,mediterranean,night
  const [currentThemeId, setCurrentThemeId] = React.useState(defaultThemeId);
  const currentTheme = themes[currentThemeId];
  const tokens = landingThemeTokens[currentTheme.id] ?? landingThemeTokens.luxury;

  

  React.useEffect(() => {
    if (!defaultThemeId) {
      return;
    }
    setCurrentThemeId(defaultThemeId);
  }, [defaultThemeId]);

  React.useEffect(() => {
    const root = document.documentElement;

    // base palette
    root.style.setProperty("--landing-primary", currentTheme.colors.primary);
    root.style.setProperty("--landing-secondary", currentTheme.colors.secondary);
    root.style.setProperty("--landing-accent", currentTheme.colors.accent);
    root.style.setProperty("--landing-background", currentTheme.colors.background);
    root.style.setProperty("--landing-text", currentTheme.colors.text);

    // derived tokens
    root.style.setProperty("--landing-surface", tokens.surface);
    root.style.setProperty("--landing-surface-soft", tokens.surfaceSoft);
    root.style.setProperty("--landing-border", tokens.border);
    root.style.setProperty("--landing-muted-text", tokens.mutedText);

    root.style.setProperty("--landing-cta-bg", tokens.ctaBg);
    root.style.setProperty("--landing-cta-text", tokens.ctaText);
    root.style.setProperty("--landing-cta-hover-bg", tokens.ctaHoverBg);

    root.style.setProperty("--landing-slot-bg", tokens.slotBackground);
    root.style.setProperty("--landing-slot-tile-bg", tokens.slotTileBg);
    root.style.setProperty("--landing-slot-tile-border", tokens.slotTileBorder);
    root.style.setProperty("--landing-slot-icon", tokens.slotIcon);
    root.style.setProperty("--landing-slot-center-bg", tokens.slotCenterBg);
    root.style.setProperty("--landing-slot-center-text", tokens.slotCenterText);
    root.style.setProperty("--landing-slot-glow-primary", tokens.slotGlowPrimary);
    root.style.setProperty("--landing-slot-glow-accent", tokens.slotGlowAccent);
  }, [currentTheme, tokens]);

  const value = React.useMemo(
    () => ({
      theme: currentTheme,
      setTheme: (id: string) => setCurrentThemeId(id),
    }),
    [currentTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className="min-h-full"
        style={{
          backgroundColor: currentTheme.colors.background,
          color: currentTheme.colors.text,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
